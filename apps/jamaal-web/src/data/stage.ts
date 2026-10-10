import { parseStage } from "../../scripts/stage-parse.mjs";

/**
 * The site's stage, baked in at build time from PUBLIC_SITE_STAGE. CI sets it
 * from Firebase Remote Config (see scripts/stage.mjs); locally, set it in
 * .env.local to preview another stage. Anything unrecognised is `waitlist`.
 */
export type Stage = "waitlist" | "testflight" | "launched";

export const STAGE: Stage = parseStage(import.meta.env.PUBLIC_SITE_STAGE);
