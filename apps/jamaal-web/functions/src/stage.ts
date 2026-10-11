export const STAGES = ["waitlist", "testflight", "launched"] as const;
export type Stage = (typeof STAGES)[number];
export const DEFAULT_STAGE: Stage = "waitlist";
export const STAGE_PARAMETER = "site_stage";

/** Same rule as the site's scripts/stage-parse.mjs: anything unrecognised is the default. */
export function parseStage(value: unknown): Stage {
  const stage = typeof value === "string" ? value.trim().toLowerCase() : "";
  return STAGES.find((s) => s === stage) ?? DEFAULT_STAGE;
}

export interface StageSource {
  get(): Promise<Stage>;
}

/**
 * Reads the stage through `fetchStage` and remembers it for `ttlMs`, so a burst
 * of signups costs one Remote Config read. If a read fails it keeps the last
 * stage it knew, or `waitlist` if it never had one, tells `onError`, and waits
 * `errorTtlMs` before trying again so an outage isn't hammered.
 */
export function createCachedStageSource(
  fetchStage: () => Promise<Stage>,
  {
    ttlMs = 60_000,
    errorTtlMs = 5_000,
    now = Date.now,
    onError = () => {},
  }: { ttlMs?: number; errorTtlMs?: number; now?: () => number; onError?: (error: unknown) => void } = {},
): StageSource {
  let cached: { stage: Stage; expiresAt: number } | undefined;
  let lastKnown: Stage = DEFAULT_STAGE;

  return {
    async get() {
      if (cached && cached.expiresAt > now()) return cached.stage;
      try {
        const stage = await fetchStage();
        lastKnown = stage;
        cached = { stage, expiresAt: now() + ttlMs };
        return stage;
      } catch (error) {
        onError(error);
        cached = { stage: lastKnown, expiresAt: now() + errorTtlMs };
        return lastKnown;
      }
    },
  };
}

/** The stage in a Remote Config template, or the default when it is missing. */
export function stageFromTemplate(template: { parameters?: Record<string, { defaultValue?: unknown }> }): Stage {
  const value = template.parameters?.[STAGE_PARAMETER]?.defaultValue as { value?: unknown } | undefined;
  return parseStage(value?.value);
}
