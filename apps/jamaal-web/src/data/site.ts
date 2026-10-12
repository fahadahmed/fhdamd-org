import { STAGE } from "./stage";

/**
 * Site-wide switches and constants.
 *
 * The stage (waitlist, testflight, launched) comes from Firebase Remote Config
 * at build time, see stage.ts. LAUNCHED is true only once the app is on the
 * App Store. The contact address, the App Store link and the site description
 * are in DatoCMS, in the site settings.
 */
export const LAUNCHED = STAGE === "launched";

/**
 * Pages that are linked from the nav and footer only once they exist. Flip each
 * to true in the PR that adds the page (Journal: #426, Press kit: #427).
 */
export const FEATURES = { journal: true, pressKit: true } as const;
