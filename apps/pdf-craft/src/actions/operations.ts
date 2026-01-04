import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { PDFDocument } from 'pdf-lib';
import { FieldValue } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getFirebaseAuth, getFirebaseApp } from '../firebase/server';
import { publish } from '../server/pubsub/publisher';

getFirebaseApp();
const firestore = admin.firestore();
const bucket = admin.storage().bucket();

const mergePdfsSchema = z.object({
  files: z.array(z.instanceof(File)),
});

const imageToPdfSchema = z.object({
  images: z.array(z.instanceof(File)),
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const operations = {
  mergePdfs: defineAction({
    accept: 'form',
    input: mergePdfsSchema,
    handler: async (input, context) => {
      const { files } = input;
      const cookieHeader = context.request.headers.get('cookie') || '';
      const sessionCookie = cookieHeader
        .split('; ')
        .find((c) => c.startsWith('__session='))
        ?.split('=')[1];

      try {
        if (!sessionCookie) {
          throw new Error('Unauthorized');
        }
        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(
          sessionCookie,
          true
        );
        const userId = decodedToken.uid;

        // Create a new Firestore doc ID for the file
        const fileId = firestore
          .collection('users')
          .doc(userId)
          .collection('files')
          .doc().id;

        const mergedPdf = await PDFDocument.create();
        for (const pdfFile of files) {
          const pdfBytes = await pdfFile.arrayBuffer();
          const pdf = await PDFDocument.load(pdfBytes, {
            ignoreEncryption: true,
          });
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
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
            contentType: 'application/pdf',
            metadata: {
              firebaseStorageDownloadTokens: downloadToken,
            },
          },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURIComponent(
          storagePath
        )}?alt=media&token=${downloadToken}`;

        // Save file metadata inside Firestore under user's `files` collection
        await firestore
          .collection('users')
          .doc(userId)
          .collection('files')
          .doc(fileId)
          .set({
            fileId,
            fileName: mergedFileName,
            fileUrl,
            operation: 'merge',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });

        // Publish a message to Pub/Sub about the new merged file
        await publish('app-event', {
          userId,
          userEmail: decodedToken.email,
          fileId,
          fileName: mergedFileName,
          fileUrl,
          eventType: 'pdf-merged',
          timestamp: Date.now(),
        });
        return {
          success: true,
          message: 'Files merged successfully',
          data: { fileUrl },
        };
      } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: 'validation error',
            issues: error.issues,
          };
        }
        return { success: false, error: 'Issue merging files' };
      }
    },
  }),

  imageToPdf: defineAction({
    accept: 'form',
    input: imageToPdfSchema,
    handler: async (input, context) => {
      const { images } = input;
      // Implementation for converting images to PDFs goes here
      // --- Auth check ---
      const cookieHeader = context.request.headers.get('cookie') || '';
      const sessionCookie = cookieHeader
        .split('; ')
        .find((c) => c.startsWith('__session='))
        ?.split('=')[1];

      if (!sessionCookie) {
        return { success: false, error: 'Unauthorized' };
      }

      try {
        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(
          sessionCookie,
          true
        );
        const userId = decodedToken.uid;

        // Validate images
        for (const image of images) {
          if (image.size > MAX_IMAGE_SIZE) {
            return {
              success: false,
              error: `Image ${image.name} exceeds the maximum size of 10MB.`,
            };
          }

          if (!['image/jpeg', 'image/png'].includes(image.type)) {
            return {
              success: false,
              error: `Image ${image.name} is not a supported format. Only JPEG and PNG are allowed.`,
            };
          }
        }

        // Create PDF document from images
        const pdfDoc = await PDFDocument.create();
        for (const imageFile of images) {
          const imageBytes = await imageFile.arrayBuffer();
          let pdfImage;
          if (imageFile.type === 'image/jpeg') {
            pdfImage = await pdfDoc.embedJpg(imageBytes);
          } else if (imageFile.type === 'image/png') {
            pdfImage = await pdfDoc.embedPng(imageBytes);
          }

          if (pdfImage) {
            const page = pdfDoc.addPage();
            const { width, height } = pdfImage.scale(1);
            page.setSize(width, height);
            page.drawImage(pdfImage, {
              x: 0,
              y: 0,
              width,
              height,
            });
          } else {
            return {
              success: false,
              error: `Failed to embed image ${imageFile.name}.`,
            };
          }
        }

        const pdfBytes = await pdfDoc.save();

        // Upload PDF to Firebase Storage and save metadata to Firestore
        const fileId = firestore
          .collection('users')
          .doc(userId)
          .collection('files')
          .doc().id;

        const pdfFileName = `images-${Date.now()}.pdf`;
        const storagePath = `users/${userId}/${pdfFileName}`;
        const fileRef = bucket.file(storagePath);

        const downloadToken = uuidv4();

        await fileRef.save(Buffer.from(pdfBytes), {
          metadata: {
            contentType: 'application/pdf',
            metadata: {
              firebaseStorageDownloadTokens: downloadToken,
            },
          },
        });

        const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURIComponent(
          storagePath
        )}?alt=media&token=${downloadToken}`;

        // Save file metadata inside Firestore under user's `files` collection
        await firestore
          .collection('users')
          .doc(userId)
          .collection('files')
          .doc(fileId)
          .set({
            fileId,
            fileName: pdfFileName,
            fileUrl,
            operation: 'image-to-pdf',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });

        // Publish a message to Pub/Sub about the new image-to-PDF file
        await publish('app-event', {
          userId,
          userEmail: decodedToken.email,
          fileId,
          fileName: pdfFileName,
          fileUrl,
          eventType: 'image-to-pdf',
          timestamp: Date.now(),
        });

        return {
          success: true,
          message: 'Images converted to PDF successfully',
          data: { fileUrl },
        };
      } catch (error) {
        console.error('Error converting images to PDF:', error);
        return {
          success: false,
          error: 'Failed to convert images to PDF',
        };
      }
    },
  }),
};
