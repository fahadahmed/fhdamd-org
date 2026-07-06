import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { PDFDocument } from "pdf-lib";
import { FieldValue } from "firebase-admin/firestore";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import { getFirebaseAuth, getFirebaseApp } from "../firebase/server";
import { publish } from "../server/pubsub/publisher";
import { log } from "../utils/lib/logger";

async function callProcessor(path: string, form: FormData): Promise<Response> {
  const processorUrl = import.meta.env.PDF_PROCESSOR_URL;
  if (!processorUrl) throw new Error("PDF_PROCESSOR_URL is not configured");
  const url = `${processorUrl}${path}`;

  if (!import.meta.env.PROD) {
    return fetch(url, { method: "POST", body: form });
  }

  // Service-to-service auth via GCP metadata server (available on App Hosting)
  const tokenRes = await fetch(
    `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(processorUrl)}`,
    { headers: { "Metadata-Flavor": "Google" } },
  );
  const token = await tokenRes.text();
  return fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
}

getFirebaseApp();
const firestore = admin.firestore();
const bucket = admin.storage().bucket();

// ── Shared helpers used by all four operation handlers ────────────────────────

interface AuthedContext {
  userId: string;
  isAnonymous: boolean;
  email?: string;
}

/** Extracts and verifies the __session cookie. Returns null when unauthorized. */
async function resolveAuth(
  context: { request: Request },
  requestId: string,
  task: string,
): Promise<AuthedContext | null> {
  const cookieHeader = context.request.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("__session="))
    ?.split("=")[1];
  if (!sessionCookie) {
    log.warn("app-operation: unauthorized", { requestId, feature: task, status: "fail" });
    return null;
  }
  const auth = await getFirebaseAuth();
  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  const isAnonymous = decoded.firebase.sign_in_provider === "anonymous";
  log.debug("app-operation: user authenticated", {
    requestId, feature: task, userId: decoded.uid,
    anonymous: isAnonymous ? "yes" : "no",
  });
  return { userId: decoded.uid, isAnonymous, email: decoded.email };
}

/** Returns the pending-anonymous action response (used when caller is anon). */
function anonPending(
  fileId: string,
  userId: string,
  requestId: string,
  task: string,
): { success: true; data: { claimToken: string } } {
  const claimToken = generateClaimToken(fileId, userId);
  log.event("📄 app-operation: pending-anonymous", { requestId, feature: task, userId, fileId });
  return { success: true, data: { claimToken } };
}

/** Publishes the app-event and deducts credits after a successful operation. */
async function finaliseOperation(params: {
  userId: string;
  email?: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  eventType: string;
  creditCost: number;
  requestId: string;
  task: string;
}): Promise<void> {
  const { userId, email, fileId, fileName, fileUrl, eventType, creditCost, requestId, task } = params;
  await publish(
    "app-event",
    { userId, userEmail: email, fileId, fileName, fileUrl, eventType, timestamp: Date.now(), requestId },
    requestId, task,
  );
  await firestore.collection("users").doc(userId).update({
    "profile.credits": FieldValue.increment(-creditCost),
  });
  log.business("💰 credit-deducted", { requestId, feature: task, userId, fileId, creditCost });
  log.business("📄 app-operation", { requestId, feature: task, userId, fileId, creditCost, status: "success" });
}

const mergePdfsSchema = z.object({
  files: z.array(z.instanceof(File)),
  requestId: z.string(),
  task: z.string(),
  creditCost: z.coerce.number().int().positive(),
});

const imageToPdfSchema = z.object({
  images: z.array(z.instanceof(File)),
  requestId: z.string(),
  task: z.string(),
  creditCost: z.coerce.number().int().positive(),
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const operations = {
  mergePdfs: defineAction({
    accept: "form",
    input: mergePdfsSchema,
    handler: async (input, context) => {
      const { files, requestId, task, creditCost } = input;
      log.event("📄 app-operation", { requestId, feature: task, status: "start" });
      try {
        const ctx = await resolveAuth(context, requestId, task);
        if (!ctx) return { success: false, error: "Unauthorized" };
        const { userId, isAnonymous } = ctx;

        const fileId = firestore.collection("users").doc(userId).collection("files").doc().id;

        const mergedPdf = await PDFDocument.create();
        for (const pdfFile of files) {
          const pdfBytes = await pdfFile.arrayBuffer();
          const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const mergedFileName = `merged-${Date.now()}.pdf`;
        const storagePath = `users/${userId}/${mergedFileName}`;
        const downloadToken = uuidv4();

        await bucket.file(storagePath).save(Buffer.from(mergedPdfBytes), {
          metadata: { contentType: "application/pdf", metadata: { firebaseStorageDownloadTokens: downloadToken } },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        log.debug("app-operation: file uploaded", { requestId, feature: task, userId, fileId });

        await firestore.collection("users").doc(userId).collection("files").doc(fileId).set({
          fileId, fileName: mergedFileName, storagePath, fileUrl, operation: "merge",
          status: isAnonymous ? "pending" : "ready", creditCost,
          createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
          expiresAt, deleted: false, deletedAt: null, deletionReason: null,
        });
        log.debug("app-operation: file metadata saved", { requestId, feature: task, userId, fileId });

        if (isAnonymous) return anonPending(fileId, userId, requestId, task);

        await finaliseOperation({ userId, email: ctx.email, fileId, fileName: mergedFileName, fileUrl, eventType: "pdf-merge", creditCost, requestId, task });
        return { success: true, message: "Files merged successfully", data: { fileUrl } };
      } catch (error) {
        if (error instanceof z.ZodError) {
          log.warn("app-operation: validation error", { requestId, feature: task, issues: error.issues });
          return { success: false, error: "validation error", issues: error.issues };
        }
        log.exception(error as Error, { requestId, feature: task });
        return { success: false, error: "Issue merging files" };
      }
    },
  }),

  imageToPdf: defineAction({
    accept: "form",
    input: imageToPdfSchema,
    handler: async (input, context) => {
      const { images, requestId, task, creditCost } = input;
      log.event("📄 app-operation", { requestId, feature: task, status: "start" });
      try {
        const ctx = await resolveAuth(context, requestId, task);
        if (!ctx) return { success: false, error: "Unauthorized" };
        const { userId, isAnonymous } = ctx;

        for (const image of images) {
          if (image.size > MAX_IMAGE_SIZE) {
            log.warn("app-operation: image size exceeds limit", { requestId, feature: task, imageName: image.name });
            return { success: false, error: `Image ${image.name} exceeds the maximum size of 10MB.` };
          }
          if (!["image/jpeg", "image/png"].includes(image.type)) {
            log.warn("app-operation: unsupported image format", { requestId, feature: task, imageName: image.name, imageType: image.type });
            return { success: false, error: `Image ${image.name} is not a supported format. Only JPEG and PNG are allowed.` };
          }
        }

        const pdfDoc = await PDFDocument.create();
        for (const imageFile of images) {
          const imageBytes = await imageFile.arrayBuffer();
          const pdfImage = imageFile.type === "image/jpeg"
            ? await pdfDoc.embedJpg(imageBytes)
            : imageFile.type === "image/png" ? await pdfDoc.embedPng(imageBytes) : null;
          if (!pdfImage) {
            log.warn("app-operation: failed to embed image", { requestId, feature: task, imageName: imageFile.name });
            return { success: false, error: `Failed to embed image ${imageFile.name}.` };
          }
          const page = pdfDoc.addPage();
          const { width, height } = pdfImage.scale(1);
          page.setSize(width, height);
          page.drawImage(pdfImage, { x: 0, y: 0, width, height });
        }

        const pdfBytes = await pdfDoc.save();
        const fileId = firestore.collection("users").doc(userId).collection("files").doc().id;
        const pdfFileName = `images-${Date.now()}.pdf`;
        const storagePath = `users/${userId}/${pdfFileName}`;
        const downloadToken = uuidv4();

        await bucket.file(storagePath).save(Buffer.from(pdfBytes), {
          metadata: { contentType: "application/pdf", metadata: { firebaseStorageDownloadTokens: downloadToken } },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        log.debug("app-operation: PDF uploaded to Firebase Storage", { requestId, feature: task, userId, fileId });

        await firestore.collection("users").doc(userId).collection("files").doc(fileId).set({
          fileId, fileName: pdfFileName, storagePath, fileUrl, operation: "image-to-pdf",
          status: isAnonymous ? "pending" : "ready", creditCost,
          createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
          expiresAt, deleted: false, deletedAt: null, deletionReason: null,
        });
        log.debug("app-operation: file metadata saved", { requestId, feature: task, userId, fileId });

        if (isAnonymous) return anonPending(fileId, userId, requestId, task);

        await finaliseOperation({ userId, email: ctx.email, fileId, fileName: pdfFileName, fileUrl, eventType: "image-to-pdf", creditCost, requestId, task });
        return { success: true, message: "Images converted to PDF successfully", data: { fileUrl } };
      } catch (error) {
        log.exception(error as Error, { requestId, feature: task });
        return { success: false, error: "Failed to convert images to PDF" };
      }
    },
  }),

  encryptPdf: defineAction({
    accept: "form",
    input: z.object({
      file: z.instanceof(File),
      userPassword: z.string().min(1),
      ownerPassword: z.string().optional(),
      permissions: z.enum(["full-access", "view-and-print", "read-only"]).default("full-access"),
      requestId: z.string(),
      task: z.string(),
      creditCost: z.coerce.number().int().positive(),
    }),
    handler: async (input, context) => {
      const { file, userPassword, ownerPassword, permissions, requestId, task, creditCost } = input;
      log.event("📄 app-operation", { requestId, feature: task, status: "start" });
      try {
        const ctx = await resolveAuth(context, requestId, task);
        if (!ctx) return { success: false, error: "Unauthorized" };
        const { userId, isAnonymous } = ctx;

        const fileId = firestore.collection("users").doc(userId).collection("files").doc().id;

        const processorForm = new FormData();
        processorForm.append("file", file);
        processorForm.append("userPassword", userPassword);
        if (ownerPassword) processorForm.append("ownerPassword", ownerPassword);
        processorForm.append("permissions", permissions);

        const processorRes = await callProcessor("/encrypt", processorForm);
        if (!processorRes.ok) {
          const body = await processorRes.json() as { error?: string };
          log.warn("app-operation: processor error", { requestId, feature: task, error: body.error });
          return { success: false, error: body.error || "Encryption failed" };
        }

        const pdfBytes = Buffer.from(await processorRes.arrayBuffer());
        const encryptedFileName = `encrypted-${Date.now()}.pdf`;
        const storagePath = `users/${userId}/${encryptedFileName}`;
        const downloadToken = uuidv4();

        await bucket.file(storagePath).save(pdfBytes, {
          metadata: { contentType: "application/pdf", metadata: { firebaseStorageDownloadTokens: downloadToken } },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await firestore.collection("users").doc(userId).collection("files").doc(fileId).set({
          fileId, fileName: encryptedFileName, storagePath, fileUrl, operation: "encrypt",
          status: isAnonymous ? "pending" : "ready", creditCost,
          createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
          expiresAt, deleted: false, deletedAt: null, deletionReason: null,
        });
        log.debug("app-operation: file metadata saved", { requestId, feature: task, userId, fileId });

        if (isAnonymous) return anonPending(fileId, userId, requestId, task);

        await finaliseOperation({ userId, email: ctx.email, fileId, fileName: encryptedFileName, fileUrl, eventType: "pdf-encrypt", creditCost, requestId, task });
        return { success: true, message: "PDF encrypted successfully", data: { fileUrl } };
      } catch (error) {
        log.exception(error as Error, { requestId, feature: task });
        return { success: false, error: "Failed to encrypt PDF" };
      }
    },
  }),

  decryptPdf: defineAction({
    accept: "form",
    input: z.object({
      file: z.instanceof(File),
      password: z.string().min(1),
      requestId: z.string(),
      task: z.string(),
      creditCost: z.coerce.number().int().positive(),
    }),
    handler: async (input, context) => {
      const { file, password, requestId, task, creditCost } = input;
      log.event("📄 app-operation", { requestId, feature: task, status: "start" });
      try {
        const ctx = await resolveAuth(context, requestId, task);
        if (!ctx) return { success: false, error: "Unauthorized" };
        const { userId, isAnonymous } = ctx;

        const fileId = firestore.collection("users").doc(userId).collection("files").doc().id;

        const processorForm = new FormData();
        processorForm.append("file", file);
        processorForm.append("password", password);

        const processorRes = await callProcessor("/decrypt", processorForm);
        if (!processorRes.ok) {
          const body = await processorRes.json() as { error?: string };
          log.warn("app-operation: processor error", { requestId, feature: task, error: body.error });
          return { success: false, error: body.error || "Decryption failed" };
        }

        const pdfBytes = Buffer.from(await processorRes.arrayBuffer());
        const decryptedFileName = `decrypted-${Date.now()}.pdf`;
        const storagePath = `users/${userId}/${decryptedFileName}`;
        const downloadToken = uuidv4();

        await bucket.file(storagePath).save(pdfBytes, {
          metadata: { contentType: "application/pdf", metadata: { firebaseStorageDownloadTokens: downloadToken } },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await firestore.collection("users").doc(userId).collection("files").doc(fileId).set({
          fileId, fileName: decryptedFileName, storagePath, fileUrl, operation: "decrypt",
          status: isAnonymous ? "pending" : "ready", creditCost,
          createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
          expiresAt, deleted: false, deletedAt: null, deletionReason: null,
        });
        log.debug("app-operation: file metadata saved", { requestId, feature: task, userId, fileId });

        if (isAnonymous) return anonPending(fileId, userId, requestId, task);

        await finaliseOperation({ userId, email: ctx.email, fileId, fileName: decryptedFileName, fileUrl, eventType: "pdf-decrypt", creditCost, requestId, task });
        return { success: true, message: "PDF decrypted successfully", data: { fileUrl } };
      } catch (error) {
        log.exception(error as Error, { requestId, feature: task });
        return { success: false, error: "Failed to decrypt PDF" };
      }
    },
  }),

  splitPdf: defineAction({
    accept: "form",
    input: z.object({
      file: z.instanceof(File),
      ranges: z.string(), // JSON string: {from:number,to:number}[]  (1-indexed, inclusive)
      requestId: z.string(),
      task: z.string(),
      creditCost: z.coerce.number().int().positive(),
    }),
    handler: async (input, context) => {
      const { file, ranges: rangesJson, requestId, task, creditCost } = input;
      log.event("📄 app-operation", { requestId, feature: task, status: "start" });
      try {
        const ctx = await resolveAuth(context, requestId, task);
        if (!ctx) return { success: false, error: "Unauthorized" };
        const { userId, isAnonymous } = ctx;

        // Parse + validate ranges
        let ranges: { from: number; to: number }[];
        try {
          ranges = JSON.parse(rangesJson);
        } catch {
          return { success: false, error: "Invalid ranges format." };
        }

        const MAX_SPLIT_RANGES = 20;
        if (!Array.isArray(ranges) || ranges.length === 0) {
          return { success: false, error: "At least one range is required." };
        }
        if (ranges.length > MAX_SPLIT_RANGES) {
          return { success: false, error: `Maximum ${MAX_SPLIT_RANGES} ranges allowed.` };
        }

        // Load source PDF — detect encrypted PDFs
        const fileBytes = await file.arrayBuffer();
        let sourceDoc: PDFDocument;
        try {
          sourceDoc = await PDFDocument.load(fileBytes);
        } catch (err: any) {
          const msg = err?.message ?? "";
          if (msg.includes("encrypted") || msg.includes("password")) {
            return { success: false, error: "This PDF is password-protected. Please decrypt it first using the Unlock PDF tool." };
          }
          throw err;
        }
        const pageCount = sourceDoc.getPageCount();

        // Validate each range against actual page count
        for (const r of ranges) {
          if (!Number.isInteger(r.from) || !Number.isInteger(r.to)) {
            return { success: false, error: "Range values must be integers." };
          }
          if (r.from < 1 || r.to > pageCount || r.from > r.to) {
            return { success: false, error: `Range ${r.from}–${r.to} is outside the document (${pageCount} pages).` };
          }
        }

        // Extract each range into a separate PDF buffer
        const parts: { name: string; bytes: Uint8Array }[] = [];
        for (let i = 0; i < ranges.length; i++) {
          const { from, to } = ranges[i];
          const partDoc = await PDFDocument.create();
          const indices = Array.from({ length: to - from + 1 }, (_, k) => from - 1 + k);
          const copied = await partDoc.copyPages(sourceDoc, indices);
          copied.forEach((p) => partDoc.addPage(p));
          parts.push({ name: `part-${i + 1}.pdf`, bytes: await partDoc.save() });
        }

        // Upload: single PDF if one range, zip if multiple
        const fileId = firestore.collection("users").doc(userId).collection("files").doc().id;
        const downloadToken = uuidv4();
        let uploadBytes: Uint8Array | Buffer;
        let outputFileName: string;
        let contentType: string;

        if (parts.length === 1) {
          uploadBytes = parts[0].bytes;
          outputFileName = `split-${Date.now()}.pdf`;
          contentType = "application/pdf";
        } else {
          const zip = new JSZip();
          parts.forEach(({ name, bytes }) => zip.file(name, bytes));
          uploadBytes = Buffer.from(await zip.generateAsync({ type: "uint8array" }));
          outputFileName = `split-${Date.now()}.zip`;
          contentType = "application/zip";
        }

        const storagePath = `users/${userId}/${outputFileName}`;
        await bucket.file(storagePath).save(Buffer.from(uploadBytes), {
          metadata: { contentType, metadata: { firebaseStorageDownloadTokens: downloadToken } },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        log.debug("app-operation: file uploaded", { requestId, feature: task, userId, fileId });

        await firestore.collection("users").doc(userId).collection("files").doc(fileId).set({
          fileId, fileName: outputFileName, storagePath, fileUrl, operation: "split",
          status: isAnonymous ? "pending" : "ready", creditCost,
          createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
          expiresAt, deleted: false, deletedAt: null, deletionReason: null,
        });
        log.debug("app-operation: file metadata saved", { requestId, feature: task, userId, fileId });

        if (isAnonymous) return anonPending(fileId, userId, requestId, task);

        await finaliseOperation({ userId, email: ctx.email, fileId, fileName: outputFileName, fileUrl, eventType: "pdf-split", creditCost, requestId, task });
        return { success: true, message: "PDF split successfully", data: { fileUrl } };
      } catch (error) {
        log.exception(error as Error, { requestId, feature: task });
        return { success: false, error: "Failed to split PDF" };
      }
    },
  }),
};
