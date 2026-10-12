import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

const load = async () => (await import("./journalPosts")).loadPosts();

describe("loadPosts", () => {
  it("uses the bundled articles when DatoCMS is not configured, newest first", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "");
    const posts = await load();
    expect(posts.map((p) => p.slug)).toEqual(["first-night-planning", "salah-quran-dhikr", "why-i-built-jamaal"]);
  });

  it("reads from DatoCMS when there is a token", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "tok");
    vi.stubEnv("DATOCMS_ENVIRONMENT", "sandbox");
    const record = { slug: "cms-post", title: "From the CMS", category: "Story", date: "2026-11-01", readMinutes: 2, excerpt: "e", lede: "l", body: null };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { allPosts: [record] } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const posts = await load();
    expect(posts.map((p) => p.slug)).toEqual(["cms-post"]);
    expect(fetchMock.mock.calls[0][1].headers["X-Environment"]).toBe("sandbox");
  });

  it("fails the build rather than ship posts with missing fields", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "tok");
    const broken = { slug: "broken", title: "No category", date: "2026-11-01", readMinutes: 2, excerpt: "e", lede: "l", body: null, category: "Story" };
    // a record the API would never return, to prove the guard: the date is not a date
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { allPosts: [{ ...broken, date: "yesterday" }] } }), { status: 200 })));
    await expect(load()).rejects.toThrow("missing required fields: broken");
  });

  it("fails the build when DatoCMS cannot be reached", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "tok");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no", { status: 500 })));
    await expect(load()).rejects.toThrow("failed: 500");
  });

  it("reads once per build", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "");
    const { loadPosts } = await import("./journalPosts");
    expect(loadPosts()).toBe(loadPosts());
  });
});
