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
  captchaToken: z.string().min(10, 'Captcha token is required'),
});

const VerifyUserSchema = z.object({
  idToken: z.string(),
  captchaToken: z.string().min(10, 'Captcha token is required'),
});

async function verifyRecaptcha(token: string) {
  const secret = import.meta.env.PUBLIC_RECAPTCHA_SECRET_KEY;
  const formData = new URLSearchParams();
  formData.append('secret', secret);
  formData.append('response', token);

  const response = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  return data.success === true && data.score >= 0.5;
}

export const user = {
  createUser: defineAction({
    accept: 'json',
    input: SignUpSchema,
    handler: async (input, _ctx) => {
      const { name, email, password, captchaToken } = input;
      // 🔐 Verify reCAPTCHA before doing anything else
      const isHuman = await verifyRecaptcha(captchaToken);

      if (!isHuman) {
        return {
          success: false,
          error: 'Captcha verification failed. Try again.',
        };
      }

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
    accept: 'json',
    input: VerifyUserSchema,
    handler: async (input, context) => {
      const { idToken, captchaToken } = input;
      // 🔐 Verify reCAPTCHA before doing anything else
      const isHuman = await verifyRecaptcha(captchaToken);

      if (!isHuman) {
        return {
          success: false,
          error: 'Captcha verification failed. Try again.',
        };
      }

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
    accept: 'json',
    input: z.object({
      captchaToken: z.string().min(10, 'Captcha token is required'),
    }),
    handler: async (input, context) => {
      const { captchaToken } = input;
      // 🔐 Verify reCAPTCHA before doing anything else
      const isHuman = await verifyRecaptcha(captchaToken);

      if (!isHuman) {
        return {
          success: false,
          error: 'Captcha verification failed. Try again.',
        };
      }
      context.cookies.delete('__session', { path: '/' });
      return { success: true };
    },
  }),
};
