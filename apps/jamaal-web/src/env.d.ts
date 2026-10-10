/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** waitlist | testflight | launched. Set by CI from Remote Config; see scripts/stage.mjs. */
  readonly PUBLIC_SITE_STAGE?: string;
}
