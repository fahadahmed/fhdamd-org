import { STAGE } from "./stage";

/**
 * Site-wide switches and constants.
 *
 * The stage (waitlist, testflight, launched) comes from Firebase Remote Config
 * at build time, see stage.ts. LAUNCHED is true only once the app is on the
 * App Store; the waitlist and testflight stages both show the pre-launch page
 * until the redesign gives each its own variant.
 */
export const LAUNCHED = STAGE === "launched";

/** Where "Download on the App Store" points. Replace with the real listing URL at launch. */
export const APP_STORE_URL = "#join";

export const CONTACT_EMAIL = "contact@fhdamd.dev";

export const COMPANY_TAGLINE = "A considered app by fhdamd";

/** Default meta description, also used in the structured data on the home page. */
export const SITE_DESCRIPTION =
  "Jamaal is a calm daily planner for iPhone, iPad and Mac. One list for today, a short plan each evening, and nothing that nags.";

/**
 * Pages that are linked from the nav and footer only once they exist. Flip each
 * to true in the PR that adds the page (Journal: #426, Press kit: #427).
 */
export const FEATURES = { journal: false, pressKit: false } as const;
