// Side-effect-only CSS imports from the Threads design system
declare module "@fhdamd/threads/tokens" {}
declare module "*.css" {}

interface ImportMetaEnv {
  /** Unset in local dev / PR preview builds by design — see Layout.astro. */
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  /** Unset locally — Sentry.init() no-ops cleanly with no dsn. See sentry.client.config.ts. */
  readonly PUBLIC_SENTRY_DSN?: string;
  readonly PUBLIC_APP_ENV?: string;
}
