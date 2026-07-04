import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import admin from 'firebase-admin';
import { getFirebaseAuth, getFirebaseApp } from '../firebase/server';
import { verifyClaimToken } from '../utils/lib/claimToken';
import { log } from '../utils/lib/logger';

getFirebaseApp();
const firestore = admin.firestore();
const bucket = admin.storage().bucket();

async function getSessionUid(context: { request: Request }, auth: admin.auth.Auth): Promise<string | null> {
  const cookieHeader = context.request.headers.get('cookie') || '';
  const sessionCookie = cookieHeader.split('; ').find((c) => c.startsWith('__session='))?.split('=')[1];
  if (!sessionCookie) return null;
  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    if (decoded.firebase.sign_in_provider === 'anonymous') return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export const claims = {
  // Moves an anonymous user's pending file to a real account — no credit deduction.
  // For same-UID (link preserved): no-op, file is already there.
  // For different-UID (sign-in to existing account): copies Storage + Firestore record.
  migrateFile: defineAction({
    accept: 'json',
    input: z.object({ claimToken: z.string() }),
    handler: async (input, context) => {
      const auth = await getFirebaseAuth();
      const realUid = await getSessionUid(context, auth);
      if (!realUid) return { success: false, error: 'Unauthorized' };

      const payload = verifyClaimToken(input.claimToken);
      if (!payload) return { success: false, error: 'Invalid or expired claim token' };

      const { fileId, anonUid } = payload;

      const anonFileRef = firestore.collection('users').doc(anonUid).collection('files').doc(fileId);
      const anonFileDoc = await anonFileRef.get();
      if (!anonFileDoc.exists) return { success: true }; // already migrated or expired

      const fileData = anonFileDoc.data()!;
      if (['claimed', 'migrated'].includes(fileData.status)) return { success: true };

      if (anonUid === realUid) {
        // File is already under this user's UID via linkWithCredential — nothing to copy
        log.event('📥 file-migration-same-uid', { feature: 'migrate-file', fileId, uid: realUid });
        return { success: true };
      }

      // Different UID — copy Storage object and create Firestore record under real user
      const storagePath: string = fileData.storagePath;
      const destPath = storagePath.replace(`users/${anonUid}/`, `users/${realUid}/`);

      await bucket.file(storagePath).copy(bucket.file(destPath));

      // Generate a correct fileUrl for the real user's storage path
      const downloadToken = fileData.fileUrl?.split('token=')[1] ?? '';
      const destFileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destPath)}?alt=media&token=${downloadToken}`;

      const realFileRef = firestore.collection('users').doc(realUid).collection('files').doc(fileId);
      await firestore.runTransaction(async (tx) => {
        tx.set(realFileRef, {
          ...fileData,
          storagePath: destPath,
          fileUrl: destFileUrl,
          status: 'migrated',
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.update(anonFileRef, { status: 'claimed' });
      });

      log.event('📥 file-migrated', { feature: 'migrate-file', fileId, anonUid, realUid });
      return { success: true };
    },
  }),

  // Downloads a pending/migrated file already under the user's account.
  // Deducts credits atomically, then generates a signed download URL.
  claimFile: defineAction({
    accept: 'json',
    input: z.object({ fileId: z.string() }),
    handler: async (input, context) => {
      const auth = await getFirebaseAuth();
      const realUid = await getSessionUid(context, auth);
      if (!realUid) return { success: false, error: 'Unauthorized' };

      const fileRef = firestore.collection('users').doc(realUid).collection('files').doc(input.fileId);
      const fileDoc = await fileRef.get();

      if (!fileDoc.exists) return { success: false, error: 'File not found' };

      const fileData = fileDoc.data()!;

      log.debug('claim-file: status check', {
        feature: 'claim-file',
        fileId: input.fileId,
        status: String(fileData.status ?? 'undefined'),
        creditCost: String(fileData.creditCost ?? 'undefined'),
      });

      if (!['pending', 'migrated'].includes(fileData.status)) {
        return { success: false, error: 'File is not awaiting payment' };
      }

      const creditCost: number = Number(fileData.creditCost);
      if (!creditCost || creditCost <= 0) {
        return { success: false, error: 'Invalid credit cost on file' };
      }

      const userRef = firestore.collection('users').doc(realUid);
      const storagePath: string = fileData.storagePath;

      // Run the Firestore transaction first — no side effects inside
      try {
        await firestore.runTransaction(async (tx) => {
          const userDoc = await tx.get(userRef);
          const fileDocInTx = await tx.get(fileRef);

          if (!userDoc.exists) throw new Error('User not found');
          if (!fileDocInTx.exists) throw new Error('File not found');

          const currentStatus: string = fileDocInTx.data()?.status;
          if (!['pending', 'migrated'].includes(currentStatus)) {
            throw new Error('File is not awaiting payment');
          }

          const currentCredits: number = userDoc.data()?.profile?.credits ?? 0;
          if (currentCredits < creditCost) throw new Error('Insufficient credits');

          tx.update(fileRef, {
            status: 'ready',
            claimedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          tx.update(userRef, {
            'profile.credits': admin.firestore.FieldValue.increment(-creditCost),
          });
        });
      } catch (error: any) {
        const known = ['Insufficient credits', 'File is not awaiting payment', 'User not found', 'File not found'];
        if (known.includes(error.message)) {
          return { success: false, error: error.message };
        }
        log.exception(error as Error, { feature: 'claim-file', fileId: input.fileId });
        return { success: false, error: 'Failed to download file' };
      }

      // Transaction committed — now generate the signed URL as a separate step
      try {
        const expiresAt = new Date(
          typeof fileData.expiresAt?.toDate === 'function'
            ? fileData.expiresAt.toDate()
            : fileData.expiresAt
        );

        const [downloadUrl] = await bucket.file(storagePath).getSignedUrl({
          action: 'read',
          expires: expiresAt,
        });

        // Store the signed URL so the dashboard Download link works after claiming
        await fileRef.update({ fileUrl: downloadUrl });

        log.business('📥 file-claimed', { feature: 'claim-file', fileId: input.fileId, realUid, creditCost });
        return { success: true, payload: { downloadUrl } };
      } catch (error) {
        // Transaction already committed — file is marked ready, credits deducted.
        // The signed URL generation failed but the credit deduction is done.
        log.exception(error as Error, { feature: 'claim-file-url', fileId: input.fileId });
        return { success: false, error: 'File claimed but download URL generation failed. Contact support.' };
      }
    },
  }),
};
