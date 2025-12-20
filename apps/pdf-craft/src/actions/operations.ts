import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { PDFDocument } from 'pdf-lib';
import { FieldValue } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getFirebaseAuth, getFirebaseApp } from '../firebase/server';

getFirebaseApp();
const firestore = admin.firestore();
const bucket = admin.storage().bucket();

const mergePdfsSchema = z.object({
  files: z.array(z.instanceof(File)),
});

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
};
