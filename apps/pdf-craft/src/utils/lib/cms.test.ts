import { describe, it, expect, vi, beforeEach } from "vitest";

const BASE_URL = "https://functions.test";

// The module has a top-level cache Map. Reset the module before each test so
// every test starts with an empty cache.
let fetchCms: (key: any, variables?: any) => Promise<unknown>;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  fetchCms = (await import("./cms")).fetchCms;
});

function makeResponse(payload: unknown, ok = true, statusText = "OK") {
  return { ok, statusText, json: async () => payload };
}

function mockFetch(payload: unknown, ok = true, statusText = "OK") {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(payload, ok, statusText)));
}

describe("fetchCms", () => {
  it("POSTs to the cms endpoint with the queryKey in the body", async () => {
    mockFetch({ data: {} });
    await fetchCms("pricing");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/cms`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryKey: "pricing", variables: undefined }),
      }),
    );
  });

  it("includes variables in the request body when provided", async () => {
    mockFetch({ data: {} });
    await fetchCms("operations", { locale: "en" });
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/cms`,
      expect.objectContaining({
        body: JSON.stringify({ queryKey: "operations", variables: { locale: "en" } }),
      }),
    );
  });

  it("returns parsed JSON on a successful response", async () => {
    const payload = { data: { allPricingOptions: [] } };
    mockFetch(payload);
    const result = await fetchCms("faqs");
    expect(result).toEqual(payload);
  });

  it("throws when the response is not ok", async () => {
    mockFetch(null, false, "Internal Server Error");
    await expect(fetchCms("testimonials")).rejects.toThrow(
      "Failed to fetch CMS data: Internal Server Error",
    );
  });

  it("caches the response and does not re-fetch on a second call with the same key", async () => {
    mockFetch({ data: "cached" });
    await fetchCms("homePage");
    await fetchCms("homePage");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("uses separate cache entries for different queryKeys", async () => {
    const spy = vi.fn()
      .mockResolvedValueOnce(makeResponse({ data: "a" }))
      .mockResolvedValueOnce(makeResponse({ data: "b" }));
    vi.stubGlobal("fetch", spy);
    await fetchCms("sectionHeaders");
    await fetchCms("faqs");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("uses separate cache entries when variables differ", async () => {
    const spy = vi.fn()
      .mockResolvedValueOnce(makeResponse({ data: "en" }))
      .mockResolvedValueOnce(makeResponse({ data: "fr" }));
    vi.stubGlobal("fetch", spy);
    await fetchCms("operations", { locale: "en" });
    await fetchCms("operations", { locale: "fr" });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("re-fetches after the cache TTL expires", async () => {
    vi.useFakeTimers();
    const spy = vi.fn()
      .mockResolvedValueOnce(makeResponse({ data: "fresh" }))
      .mockResolvedValueOnce(makeResponse({ data: "refreshed" }));
    vi.stubGlobal("fetch", spy);
    await fetchCms("pricing");
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    await fetchCms("pricing");
    expect(spy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
