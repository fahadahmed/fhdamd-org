/**
 * The pure half of stage handling: no Node imports, so the site can bundle it
 * for the browser. scripts/stage.mjs adds the Remote Config reading.
 */
export const STAGES = /** @type {const} */ (["waitlist", "testflight", "launched"]);
export const DEFAULT_STAGE = "waitlist";
export const STAGE_PARAMETER = "site_stage";

/** @param {unknown} value @returns {"waitlist" | "testflight" | "launched"} */
export function parseStage(value) {
  const stage = typeof value === "string" ? value.trim().toLowerCase() : "";
  return STAGES.find((s) => s === stage) ?? DEFAULT_STAGE;
}

/** The stage in a Remote Config template, or the default when it is missing or unknown. */
export function stageFromTemplate(template) {
  return parseStage(template?.parameters?.[STAGE_PARAMETER]?.defaultValue?.value);
}
