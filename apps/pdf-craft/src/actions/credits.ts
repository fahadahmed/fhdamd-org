import { defineAction } from 'astro:actions';
import admin from 'firebase-admin';
import { getFirebaseAuth, getFirebaseApp } from '../firebase/server';
import { z } from 'astro:schema';

getFirebaseApp();
const firestore = admin.firestore();

export const credits = {
  getUserCredits: defineAction({
    accept: 'form',
    input: undefined, // No input schema needed for this action
    handler: async (_input, context) => {
      const cookieHeader = context.request.headers.get('cookie') || '';
      const sessionCookie = cookieHeader
        .split('; ')
        .find((c) => c.startsWith('__session='))
        ?.split('=')[1];

      if (!sessionCookie) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      try {
        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(
          sessionCookie,
          true
        );
        const userId = decodedToken.uid;

        const userRef = firestore.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          return {
            success: false,
            error: 'User not found',
          };
        }

        const userData = userDoc.data();
        return {
          success: true,
          payload: {
            credits: userData?.profile?.credits || 0,
          },
        };
      } catch (error) {
        console.error('Error fetching user credits:', error);
        return {
          success: false,
          error: 'Failed to fetch user credits',
        };
      }
    },
  }),
  checkCredits: defineAction({
    accept: 'json',
    input: z.object({
      task: z.string(),
    }),
    handler: async (input, context) => {
      const { task } = input;
      const cookieHeader = context.request.headers.get('cookie') || '';
      const sessionCookie = cookieHeader
        .split('; ')
        .find((c) => c.startsWith('__session='))
        ?.split('=')[1];

      if (!sessionCookie) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      try {
        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(
          sessionCookie,
          true
        );
        const userId = decodedToken.uid;

        const userRef = firestore.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          return {
            success: false,
            error: 'User not found',
          };
        }

        const userData = userDoc.data();
        const credits = userData?.profile?.credits || 0;

        // Assuming each task costs 1 credit
        if (credits <= 0) {
          return {
            success: false,
            error: 'Insufficient credits',
          };
        }

        // Deduct one credit for the task
        await userRef.update({
          'profile.credits': admin.firestore.FieldValue.increment(-1),
        });

        return {
          success: true,
          payload: {
            message: `Task ${task} executed successfully`,
          },
        };
      } catch (error) {
        console.error('Error checking credits:', error);
        return {
          success: false,
          error: 'Failed to check credits',
        };
      }
    },
  }),
  buyCredits: defineAction({
    accept: 'form',
    input: z.object({
      credits: z.coerce.number(),
    }),
    handler: async (input, context) => {
      const { credits } = input;
      const cookieHeader = context.request.headers.get('cookie') || '';
      const sessionCookie = cookieHeader
        .split('; ')
        .find((c) => c.startsWith('__session='))
        ?.split('=')[1];

      if (!sessionCookie) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      try {
        const auth = await getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(
          sessionCookie,
          true
        );
        const userId = decodedToken.uid;

        const userRef = firestore.collection('users').doc(userId);
        // process payment logic here

        await userRef.update({
          'profile.credits': admin.firestore.FieldValue.increment(credits),
        });

        return {
          success: true,
          payload: {
            message: `Successfully added ${credits} credits`,
          },
        };
      } catch (error) {
        console.error('Error buying credits:', error);
        return {
          success: false,
          error: 'Failed to buy credits',
        };
      }
    },
  }),
};
