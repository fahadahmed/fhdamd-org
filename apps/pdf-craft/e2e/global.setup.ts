import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const AUTH_FILE = 'e2e/.auth/user.json';
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

async function globalSetup() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const apiKey = process.env.PUBLIC_FIREBASE_API_KEY;
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  const baseURL = process.env.BASE_URL ?? 'https://stg.riqa.app';

  if (!serviceAccountKey || !apiKey || !email || !password) {
    console.warn(
      'Missing FIREBASE_SERVICE_ACCOUNT_KEY, PUBLIC_FIREBASE_API_KEY, E2E_TEST_EMAIL, or E2E_TEST_PASSWORD — skipping auth setup. Authenticated tests will fail.',
    );
    return;
  }

  const credentials = JSON.parse(serviceAccountKey);
  const app = getApps().length === 0
    ? initializeApp({ credential: cert(credentials) })
    : getApps()[0];
  const auth = getAuth(app);

  // Sign in via REST API — bypasses the app's own reCAPTCHA-gated verifyUser action entirely
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  const body = await res.json();
  if (!body.idToken) {
    throw new Error(`Failed to sign in test user: ${JSON.stringify(body.error ?? body)}`);
  }

  const sessionCookie = await auth.createSessionCookie(body.idToken, { expiresIn: FIVE_DAYS_MS });
  const domain = new URL(baseURL).hostname;

  const storageState = {
    cookies: [
      {
        name: '__session',
        value: sessionCookie,
        domain,
        path: '/',
        expires: Math.floor(Date.now() / 1000) + Math.floor(FIVE_DAYS_MS / 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'Strict' as const,
      },
    ],
    origins: [],
  };

  mkdirSync(dirname(AUTH_FILE), { recursive: true });
  writeFileSync(AUTH_FILE, JSON.stringify(storageState, null, 2));
  console.log(`Auth state saved for ${email}`);
}

export default globalSetup;
