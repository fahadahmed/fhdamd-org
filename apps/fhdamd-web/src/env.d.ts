// Side-effect-only CSS imports from the Threads design system
declare module "@fhdamd/threads/tokens" {}
declare module "*.css" {}

interface ImportMetaEnv {
  /** Unset in local dev / PR preview builds by design — see Layout.astro. */
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
}
