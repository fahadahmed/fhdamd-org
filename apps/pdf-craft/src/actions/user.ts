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

  sendPasswordReset: defineAction({
    accept: 'json',
    input: z.object({
      email: z.string().email('Invalid email address'),
      captchaToken: z.string().min(1),
    }),
    handler: async (input) => {
      const { email, captchaToken } = input;
      log.event("🔑 password-reset-request", { feature: "forgot-password", status: "start" });

      const isHuman = await verifyRecaptcha(captchaToken);
      if (!isHuman) {
        log.warn("🔑 password-reset: captcha failed", { feature: "forgot-password", status: "fail" });
        return { success: false, error: 'Captcha verification failed. Please try again.' };
      }

      try {
        const auth = await getFirebaseAuth();
        const resetLink = await auth.generatePasswordResetLink(email);

        const apiKey = import.meta.env.RESEND_API_KEY;
        if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

        const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'DM Sans',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%">
        <tr><td style="background:#2b2825;padding:28px 36px">
          <span style="font-size:20px;font-weight:700;color:#f5f4f0;letter-spacing:-0.02em">Riqa</span>
        </td></tr>
        <tr><td style="padding:36px 36px 28px">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1916;letter-spacing:-0.02em">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#5a5754;line-height:1.6">
            We received a request to reset the password for your Riqa account. Click the button below to choose a new password.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td>
            <a href="${resetLink}" style="display:inline-block;background:#c84b2f;color:#ffffff;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:-0.01em">Reset password</a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:13px;color:#8a8784;line-height:1.6">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will not change.
          </p>
        </td></tr>
        <tr><td style="background:#f5f4f0;padding:20px 36px;border-top:1px solid #e8e6e1">
          <p style="margin:0;font-size:12px;color:#8a8784">© ${new Date().getFullYear()} Riqa. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Riqa <no-reply@riqa.app>',
            to: [email],
            subject: 'Reset your Riqa password',
            html,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Resend error: ${err}`);
        }

        log.business("🔑 password-reset-sent", { feature: "forgot-password", status: "success" });
      } catch (error: any) {
        // auth/user-not-found — return success anyway so we don't leak whether the email exists
        if (error?.code === 'auth/user-not-found') {
          log.warn("🔑 password-reset: user not found", { feature: "forgot-password" });
          return { success: true };
        }
        log.exception(error as Error, { feature: "forgot-password" });
        return { success: false, error: 'Failed to send reset email. Please try again.' };
      }

      return { success: true };
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

  // Creates a short-lived session cookie for an anonymous Firebase user so
  // server-side actions can verify them via verifySessionCookie as usual.
  createAnonymousSession: defineAction({
    accept: 'json',
    input: z.object({ idToken: z.string() }),
    handler: async (input, context) => {
      const auth = await getFirebaseAuth();
      try {
        const decoded = await auth.verifyIdToken(input.idToken);
        if (decoded.firebase.sign_in_provider !== 'anonymous') {
          return { success: false, error: 'Invalid token type' };
        }
        const oneHour = 60 * 60 * 1000;
        const sessionCookie = await auth.createSessionCookie(input.idToken, { expiresIn: oneHour });
        context.cookies.set('__session', sessionCookie, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60,
        });
        log.event("👤 anon-session-created", { feature: "anonymous-auth", userId: decoded.uid });
        return { success: true };
      } catch (error) {
        log.exception(error as Error, { feature: "anonymous-auth" });
        return { success: false, error: 'Failed to create anonymous session' };
      }
    },
  }),

  // Called after linkWithCredential succeeds client-side. Creates a real
  // session cookie for the now-permanent account and initialises their
  // Firestore profile if it doesn't exist yet (anon users have none).
  finalizeLinkedUser: defineAction({
    accept: 'json',
    input: z.object({ idToken: z.string(), name: z.string().optional() }),
    handler: async (input, context) => {
      const auth = await getFirebaseAuth();
      try {
        const decoded = await auth.verifyIdToken(input.idToken);
        if (decoded.firebase.sign_in_provider === 'anonymous') {
          return { success: false, error: 'Token is still anonymous' };
        }

        const firestore = await getFirebaseFirestore();
        const userRef = firestore.collection('users').doc(decoded.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          await userRef.set({
            profile: {
              name: input.name ?? decoded.name ?? decoded.email ?? 'Riqa user',
              isSubscriber: false,
              credits: 0,
            },
          });
        }

        const fiveDays = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await auth.createSessionCookie(input.idToken, { expiresIn: fiveDays });
        context.cookies.set('__session', sessionCookie, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 5,
        });

        log.business("🔐 user-linked", { feature: "anonymous-upgrade", userId: decoded.uid });
        return { success: true };
      } catch (error) {
        log.exception(error as Error, { feature: "anonymous-upgrade" });
        return { success: false, error: 'Failed to finalise account' };
      }
    },
  }),
};
