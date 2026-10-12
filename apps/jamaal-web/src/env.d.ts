/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** waitlist | testflight | launched. Set by CI from Remote Config; see scripts/stage.mjs. */
  readonly PUBLIC_SITE_STAGE?: string;
  /** GA4 measurement ID of the jamaal-web Firebase app. Analytics is off without it. */
  readonly PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
  /** Sentry DSN for browser errors. Error reporting is off without it. */
  readonly PUBLIC_SENTRY_DSN?: string;
}
