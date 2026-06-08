/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
  getFirebaseAuth,
  getFirebaseApp,
  getFirebaseFirestore,
} from '../firebase/server';
import { log } from '../utils/lib/logger';

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
      log.event("🔐 user-registration", { feature: "sign-up", status: "start" });

      const isHuman = await verifyRecaptcha(captchaToken);
      if (!isHuman) {
        log.warn("🔐 user-registration: captcha failed", { feature: "sign-up", status: "fail" });
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

        const userRef = firestore.collection('users').doc(userRecord.uid);
        await userRef.set({
          profile: {
            name,
            isSubscriber: false,
            credits: 0,
          },
        });

        log.business("🔐 user-registered", {
          feature: "sign-up",
          status: "success",
          userId: userRecord.uid,
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
          log.warn("🔐 user-registration: email already exists", { feature: "sign-up", status: "fail" });
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

        log.exception(error as Error, { feature: "sign-up" });
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
      log.event("🔑 user-signin", { feature: "sign-in", status: "start" });

      const isHuman = await verifyRecaptcha(captchaToken);
      if (!isHuman) {
        log.warn("🔑 user-signin: captcha failed", { feature: "sign-in", status: "fail" });
        return {
          success: false,
          error: 'Captcha verification failed. Try again.',
        };
      }

      const auth = await getFirebaseAuth();
      try {
        let decodedIdToken;
        try {
          decodedIdToken = await auth.verifyIdToken(idToken);
        } catch (error) {
          log.warn("🔑 user-signin: invalid id token", { feature: "sign-in", status: "fail" });
          return {
            success: false,
            error: 'Invalid Token',
            status: 401,
          };
        }

        const userId = decodedIdToken.uid;
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

        log.business("🔑 user-signed-in", {
          feature: "sign-in",
          status: "success",
          userId,
        });
      } catch (error) {
        log.exception(error as Error, { feature: "sign-in" });
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
    input: undefined,
    handler: async (_input, context) => {
      context.cookies.delete('__session', {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      log.event("🚪 user-signout", { feature: "sign-out", status: "success" });
      return { success: true };
    },
  }),
};
