/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
  getFirebaseAuth,
  getFirebaseApp,
  getFirebaseFirestore,
} from '../firebase/server';

getFirebaseApp();

const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const VerifyUserSchema = z.object({
  idToken: z.string(),
});

export const user = {
  createUser: defineAction({
    accept: 'form',
    input: SignUpSchema,
    handler: async (input, _ctx) => {
      const { name, email, password } = input;
      try {
        const auth = await getFirebaseAuth();
        const firestore = await getFirebaseFirestore();
        const userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: name,
        });

        // 2. Create user profile inside 'profile' field
        const userRef = firestore.collection('users').doc(userRecord.uid);
        await userRef.set({
          profile: {
            name,
            isSubscriber: false,
            credits: 0,
          },
        });

        return {
          success: true,
          payload: {
            userId: userRecord.uid,
            name: userRecord.displayName,
            email: userRecord.email,
          },
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: 'validation error',
            issues: error.issues,
          };
        }

        if ((error as any).code === 'auth/email-already-exists') {
          return {
            success: false,
            error: 'Account with this email already exists',
          };
        }

        if ((error as any).code === 'auth/invalid-password') {
          return {
            success: false,
            error: 'Password must be at least 6 characters',
          };
        }

        // eslint-disable-next-line no-console
        console.log('error', error);
        return {
          success: false,
          error: 'Issue creating a new user',
        };
      }
    },
  }),

  verifyUser: defineAction({
    accept: 'form',
    input: VerifyUserSchema,
    handler: async (input, context) => {
      const { idToken } = input;
      const auth = await getFirebaseAuth();
      try {
        try {
          await auth.verifyIdToken(idToken);
        } catch (error) {
          return {
            success: false,
            error: 'Invalid Token',
            status: 401,
          };
        }
        // Create and set session cookie
        const fiveDays = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await auth.createSessionCookie(idToken, {
          expiresIn: fiveDays,
        });

        context.cookies.set('__session', sessionCookie, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: fiveDays,
        });
      } catch (error) {
        console.error('Error verifying user:', error);
        return {
          success: false,
          error: 'Failed to verify user',
          status: 500,
        };
      }
      return {
        success: true,
        redirected: true,
        url: '/dashboard',
      };
    },
  }),

  signOutUser: defineAction({
    accept: 'form',
    handler: async (_input, context) => {
      const auth = await getFirebaseAuth();
      context.cookies.delete('__session');
      return {
        success: true,
        redirected: true,
        url: '/',
      };
    },
  }),
};
