import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSENGER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

const db = getFirestore(app);

// Firestore internally aborts its own in-flight watch stream requests during
// WebSocket reconnects. These rejections are unhandled inside the SDK itself
// and cannot be caught from user code.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.name === 'AbortError') {
      event.preventDefault();
    }
  });
}

export { app, auth, db, analytics };
