import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { PDFDocument } from "pdf-lib";
import { FieldValue } from "firebase-admin/firestore";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
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
      const { files, requestId, task } = input;
      const cookieHeader = context.request.headers.get("cookie") || "";
      const sessionCookie = cookieHeader
        .split("; ")
        .find((c) => c.startsWith("__session="))
        ?.split("=")[1];

      log.event("app-operation", {
        requestId,
        feature: task,
        status: "start",
      });

      try {
        if (!sessionCookie) {
          log.warn("app-operation: unauthorized", {
            requestId,
            feature: task,
            status: "fail",
          });
          return { success: false, error: "Unauthorized" };
        }

        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(
          sessionCookie,
          true,
        );
        const userId = decodedToken.uid;
        log.debug("app-operation: user authenticated", {
          requestId,
          feature: task,
          userId,
        });

        const fileId = firestore
          .collection("users")
          .doc(userId)
          .collection("files")
          .doc().id;

        // Merge PDFs
        const mergedPdf = await PDFDocument.create();
        for (const pdfFile of files) {
          const pdfBytes = await pdfFile.arrayBuffer();
          const pdf = await PDFDocument.load(pdfBytes, {
            ignoreEncryption: true,
          });
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices(),
          );
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const mergedFileName = `merged-${Date.now()}.pdf`;
        const storagePath = `users/${userId}/${mergedFileName}`;
        const fileRef = bucket.file(storagePath);

        const downloadToken = uuidv4();

        await fileRef.save(Buffer.from(mergedPdfBytes), {
          metadata: {
            contentType: "application/pdf",
            metadata: { firebaseStorageDownloadTokens: downloadToken },
          },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;

        // Determine retention (24h for free users)
        const retentionMs = 24 * 60 * 60 * 1000; // adjust per subscription plan
        const expiresAt = new Date(Date.now() + retentionMs);
        log.debug("app-operation: file uploaded", {
          requestId,
          feature: task,
          userId,
          fileId,
        });

        // Save Firestore metadata
        await firestore
          .collection("users")
          .doc(userId)
          .collection("files")
          .doc(fileId)
          .set({
            fileId,
            fileName: mergedFileName,
            storagePath,
            fileUrl,
            operation: "merge",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            expiresAt,
            deleted: false,
            deletedAt: null,
            deletionReason: null,
          });
        log.debug("app-operation: file metadata saved", {
          requestId,
          feature: task,
          userId,
          fileId,
        });

        // Publish event
        await publish(
          "app-event",
          {
            userId,
            userEmail: decodedToken.email,
            fileId,
            fileName: mergedFileName,
            fileUrl,
            eventType: "pdf-merge",
            timestamp: Date.now(),
            requestId,
          },
          requestId,
          task,
        );
        await firestore.collection("users").doc(userId).update({
          "profile.credits": FieldValue.increment(-creditCost),
        });
        log.event("app-operation", {
          requestId,
          feature: task,
          status: "success",
        });

        return {
          success: true,
          message: "Files merged successfully",
          data: { fileUrl },
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          log.warn("app-operation: validation error", {
            requestId,
            feature: task,
            issues: error.issues,
          });
          return {
            success: false,
            error: "validation error",
            issues: error.issues,
          };
        }
        log.error("app-operation: unexpected error", {
          requestId,
          feature: task,
          error: error instanceof Error ? error.message : String(error),
        });
        return { success: false, error: "Issue merging files" };
      }
    },
  }),

  imageToPdf: defineAction({
    accept: "form",
    input: imageToPdfSchema,
    handler: async (input, context) => {
      const { images, requestId, task } = input;
      const cookieHeader = context.request.headers.get("cookie") || "";
      const sessionCookie = cookieHeader
        .split("; ")
        .find((c) => c.startsWith("__session="))
        ?.split("=")[1];

      log.event("app-operation", {
        requestId,
        feature: task,
        status: "start",
      });

      if (!sessionCookie) {
        log.warn("app-operation: unauthorized", {
          requestId,
          feature: task,
          status: "fail",
        });
        return { success: false, error: "Unauthorized" };
      }

      try {
        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(
          sessionCookie,
          true,
        );
        const userId = decodedToken.uid;
        log.debug("app-operation: user authenticated", {
          requestId,
          feature: task,
          userId,
        });

        // Validate images
        for (const image of images) {
          if (image.size > MAX_IMAGE_SIZE) {
            log.warn("app-operation: image size exceeds limit", {
              requestId,
              feature: task,
              imageName: image.name,
            });

            return {
              success: false,
              error: `Image ${image.name} exceeds the maximum size of 10MB.`,
            };
          }
          if (!["image/jpeg", "image/png"].includes(image.type)) {
            log.warn("app-operation: unsupported image format", {
              requestId,
              feature: task,
              imageName: image.name,
              imageType: image.type,
            });
            return {
              success: false,
              error: `Image ${image.name} is not a supported format. Only JPEG and PNG are allowed.`,
            };
          }
        }

        // Create PDF from images
        const pdfDoc = await PDFDocument.create();
        for (const imageFile of images) {
          const imageBytes = await imageFile.arrayBuffer();
          let pdfImage;
          if (imageFile.type === "image/jpeg")
            pdfImage = await pdfDoc.embedJpg(imageBytes);
          else if (imageFile.type === "image/png")
            pdfImage = await pdfDoc.embedPng(imageBytes);

          if (pdfImage) {
            const page = pdfDoc.addPage();
            const { width, height } = pdfImage.scale(1);
            page.setSize(width, height);
            page.drawImage(pdfImage, { x: 0, y: 0, width, height });
          } else {
            log.warn("app-operation: failed to embed image", {
              requestId,
              feature: task,
              imageName: imageFile.name,
            });
            return {
              success: false,
              error: `Failed to embed image ${imageFile.name}.`,
            };
          }
        }

        const pdfBytes = await pdfDoc.save();

        // Upload PDF to Firebase Storage
        const fileId = firestore
          .collection("users")
          .doc(userId)
          .collection("files")
          .doc().id;
        const pdfFileName = `images-${Date.now()}.pdf`;
        const storagePath = `users/${userId}/${pdfFileName}`;
        const fileRef = bucket.file(storagePath);
        const downloadToken = uuidv4();

        await fileRef.save(Buffer.from(pdfBytes), {
          metadata: {
            contentType: "application/pdf",
            metadata: { firebaseStorageDownloadTokens: downloadToken },
          },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          storagePath,
        )}?alt=media&token=${downloadToken}`;
        log.debug("app-operation: PDF uploaded to Firebase Storage", {
          requestId,
          feature: task,
          userId,
          fileId,
        });

        // Determine retention period (24h for free users, configurable later)
        const retentionMs = 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + retentionMs);

        // Save metadata to Firestore
        await firestore
          .collection("users")
          .doc(userId)
          .collection("files")
          .doc(fileId)
          .set({
            fileId,
            fileName: pdfFileName,
            storagePath,
            fileUrl,
            operation: "image-to-pdf",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            expiresAt,
            deleted: false,
            deletedAt: null,
            deletionReason: null,
          });
        log.debug("app-operation: file metadata saved", {
          requestId,
          feature: task,
          userId,
          fileId,
        });

        // Publish event to Pub/Sub
        await publish(
          "app-event",
          {
            userId,
            userEmail: decodedToken.email,
            fileId,
            fileName: pdfFileName,
            fileUrl,
            eventType: "image-to-pdf",
            timestamp: Date.now(),
            requestId,
          },
          requestId,
          task,
        );
        await firestore.collection("users").doc(userId).update({
          "profile.credits": FieldValue.increment(-creditCost),
        });
        log.event("app-operation", {
          requestId,
          feature: task,
          status: "success",
        });

        return {
          success: true,
          message: "Images converted to PDF successfully",
          data: { fileUrl },
        };
      } catch (error) {
        log.error("app-operation: unexpected error", {
          requestId,
          feature: task,
          error: error instanceof Error ? error.message : String(error),
        });
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
      const cookieHeader = context.request.headers.get("cookie") || "";
      const sessionCookie = cookieHeader
        .split("; ")
        .find((c) => c.startsWith("__session="))
        ?.split("=")[1];

      log.event("app-operation", { requestId, feature: task, status: "start" });

      if (!sessionCookie) {
        log.warn("app-operation: unauthorized", { requestId, feature: task, status: "fail" });
        return { success: false, error: "Unauthorized" };
      }

      try {
        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const userId = decodedToken.uid;
        log.debug("app-operation: user authenticated", { requestId, feature: task, userId });

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
        const fileRef = bucket.file(storagePath);
        const downloadToken = uuidv4();

        await fileRef.save(pdfBytes, {
          metadata: {
            contentType: "application/pdf",
            metadata: { firebaseStorageDownloadTokens: downloadToken },
          },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await firestore.collection("users").doc(userId).collection("files").doc(fileId).set({
          fileId,
          fileName: encryptedFileName,
          storagePath,
          fileUrl,
          operation: "encrypt",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          expiresAt,
          deleted: false,
          deletedAt: null,
          deletionReason: null,
        });
        log.debug("app-operation: file metadata saved", { requestId, feature: task, userId, fileId });

        await publish(
          "app-event",
          {
            userId,
            userEmail: decodedToken.email,
            fileId,
            fileName: encryptedFileName,
            fileUrl,
            eventType: "pdf-encrypt",
            timestamp: Date.now(),
            requestId,
          },
          requestId,
          task,
        );
        await firestore.collection("users").doc(userId).update({
          "profile.credits": FieldValue.increment(-creditCost),
        });
        log.event("app-operation", { requestId, feature: task, status: "success" });

        return { success: true, message: "PDF encrypted successfully", data: { fileUrl } };
      } catch (error) {
        log.error("app-operation: unexpected error", {
          requestId,
          feature: task,
          error: error instanceof Error ? error.message : String(error),
        });
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
      const cookieHeader = context.request.headers.get("cookie") || "";
      const sessionCookie = cookieHeader
        .split("; ")
        .find((c) => c.startsWith("__session="))
        ?.split("=")[1];

      log.event("app-operation", { requestId, feature: task, status: "start" });

      if (!sessionCookie) {
        log.warn("app-operation: unauthorized", { requestId, feature: task, status: "fail" });
        return { success: false, error: "Unauthorized" };
      }

      try {
        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const userId = decodedToken.uid;
        log.debug("app-operation: user authenticated", { requestId, feature: task, userId });

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
        const fileRef = bucket.file(storagePath);
        const downloadToken = uuidv4();

        await fileRef.save(pdfBytes, {
          metadata: {
            contentType: "application/pdf",
            metadata: { firebaseStorageDownloadTokens: downloadToken },
          },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await firestore.collection("users").doc(userId).collection("files").doc(fileId).set({
          fileId,
          fileName: decryptedFileName,
          storagePath,
          fileUrl,
          operation: "decrypt",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          expiresAt,
          deleted: false,
          deletedAt: null,
          deletionReason: null,
        });
        log.debug("app-operation: file metadata saved", { requestId, feature: task, userId, fileId });

        await publish(
          "app-event",
          {
            userId,
            userEmail: decodedToken.email,
            fileId,
            fileName: decryptedFileName,
            fileUrl,
            eventType: "pdf-decrypt",
            timestamp: Date.now(),
            requestId,
          },
          requestId,
          task,
        );
        await firestore.collection("users").doc(userId).update({
          "profile.credits": FieldValue.increment(-creditCost),
        });
        log.event("app-operation", { requestId, feature: task, status: "success" });

        return { success: true, message: "PDF decrypted successfully", data: { fileUrl } };
      } catch (error) {
        log.error("app-operation: unexpected error", {
          requestId,
          feature: task,
          error: error instanceof Error ? error.message : String(error),
        });
        return { success: false, error: "Failed to decrypt PDF" };
      }
    },
  }),
};
