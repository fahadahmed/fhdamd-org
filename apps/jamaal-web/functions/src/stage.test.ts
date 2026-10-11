import { describe, expect, it, vi } from "vitest";
import { createCachedStageSource, parseStage, stageFromTemplate } from "./stage";

describe("parseStage", () => {
  it("accepts the three stages, trimmed and case-insensitive", () => {
    expect(parseStage("testflight")).toBe("testflight");
    expect(parseStage(" Launched ")).toBe("launched");
    expect(parseStage("waitlist")).toBe("waitlist");
  });

  it.each([undefined, null, "", "live", 3])("falls back to waitlist for %j", (value) => {
    expect(parseStage(value)).toBe("waitlist");
  });
});

describe("stageFromTemplate", () => {
  it("reads the site_stage default value", () => {
    expect(stageFromTemplate({ parameters: { site_stage: { defaultValue: { value: "testflight" } } } })).toBe("testflight");
  });

  it("falls back to waitlist when the parameter is missing", () => {
    expect(stageFromTemplate({})).toBe("waitlist");
    expect(stageFromTemplate({ parameters: {} })).toBe("waitlist");
  });
});

describe("createCachedStageSource", () => {
  it("reads once and serves the cache until it expires", async () => {
    let time = 0;
    const fetchStage = vi.fn().mockResolvedValue("testflight");
    const source = createCachedStageSource(fetchStage, { ttlMs: 1000, now: () => time });
    expect(await source.get()).toBe("testflight");
    time = 999;
    expect(await source.get()).toBe("testflight");
    expect(fetchStage).toHaveBeenCalledTimes(1);
    time = 1000;
    await source.get();
    expect(fetchStage).toHaveBeenCalledTimes(2);
  });

  it("picks up a changed stage after the cache expires", async () => {
    let time = 0;
    const fetchStage = vi.fn().mockResolvedValueOnce("waitlist").mockResolvedValueOnce("testflight");
    const source = createCachedStageSource(fetchStage, { ttlMs: 10, now: () => time });
    expect(await source.get()).toBe("waitlist");
    time = 11;
    expect(await source.get()).toBe("testflight");
  });

  it("keeps the last known stage when a later read fails, and reports it", async () => {
    let time = 0;
    const onError = vi.fn();
    const fetchStage = vi.fn().mockResolvedValueOnce("testflight").mockRejectedValueOnce(new Error("down"));
    const source = createCachedStageSource(fetchStage, { ttlMs: 10, now: () => time, onError });
    await source.get();
    time = 11;
    expect(await source.get()).toBe("testflight");
    expect(onError).toHaveBeenCalledOnce();
  });

  it("uses waitlist when the very first read fails", async () => {
    const source = createCachedStageSource(vi.fn().mockRejectedValue(new Error("down")));
    expect(await source.get()).toBe("waitlist");
  });
});

describe("createCachedStageSource: failures", () => {
  it("waits before retrying after a failed read, so an outage is not hammered", async () => {
    let time = 0;
    const onError = vi.fn();
    const fetchStage = vi.fn().mockRejectedValue(new Error("down"));
    const source = createCachedStageSource(fetchStage, { errorTtlMs: 100, now: () => time, onError });
    await source.get();
    await source.get();
    expect(fetchStage).toHaveBeenCalledTimes(1);
    time = 100;
    await source.get();
    expect(fetchStage).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
