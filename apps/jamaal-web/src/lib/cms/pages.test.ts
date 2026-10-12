import { beforeEach, describe, expect, it, vi } from "vitest";
import { rawContent, rawHome, rawJournal, rawPress, rawSite } from "./fixtures";

const fetchCms = vi.fn();
vi.mock("./client", () => ({ fetchCms: (...args: unknown[]) => fetchCms(...args) }));
vi.mock("../errorReporting", () => ({ ERROR_REPORTING_AVAILABLE: true }));

const pages = await import("./pages");
const queries = await import("./queries");

describe("page loaders", () => {
  beforeEach(() => fetchCms.mockReset());

  it("makes one request per page, with that page's query", async () => {
    fetchCms.mockResolvedValueOnce({ siteConfig: rawSite() });
    await pages.loadSite();
    fetchCms.mockResolvedValueOnce(rawHome());
    await pages.loadHome();
    fetchCms.mockResolvedValueOnce(rawPress());
    await pages.loadPress();
    fetchCms.mockResolvedValueOnce(rawJournal());
    await pages.loadJournal();
    fetchCms.mockResolvedValueOnce(rawJournal());
    await pages.loadJournalArticles();
    fetchCms.mockResolvedValueOnce(rawContent());
    await pages.loadContentPage("privacy");

    expect(fetchCms.mock.calls.map((c) => c[0])).toEqual([
      queries.SITE_QUERY,
      queries.HOME_QUERY,
      queries.PRESS_QUERY,
      queries.JOURNAL_QUERY,
      queries.POSTS_QUERY,
      queries.CONTENT_PAGE_QUERY,
    ]);
    expect(fetchCms.mock.calls[5][1]).toEqual({ key: "privacy" });
  });

  it("returns the site settings with every page", async () => {
    fetchCms.mockResolvedValueOnce(rawHome());
    const { site, page } = await pages.loadHome();
    expect(site.contactEmail).toBe("[contactEmail]");
    expect(page.hero.title).toBe("[heroTitle]");
  });

  it("works out what each page puts in its head, from its own settings first", async () => {
    const home = rawHome();
    home.homePage!.seo = { title: "Custom home title", noIndex: true };
    fetchCms.mockResolvedValueOnce(home);
    const loaded = await pages.loadHome();
    expect(loaded.seo).toMatchObject({ title: "Custom home title", description: "[siteDescription]", noindex: true });

    fetchCms.mockResolvedValueOnce(rawContent());
    expect((await pages.loadContentPage("privacy")).seo).toMatchObject({ title: "Privacy — [siteName]", description: "How we handle your information." });

    fetchCms.mockResolvedValueOnce(rawPress());
    expect((await pages.loadPress()).seo.title).toBe("Press kit — [siteName]");

    fetchCms.mockResolvedValueOnce(rawJournal());
    expect((await pages.loadJournal()).seo).toMatchObject({ title: "Journal — [siteName]", description: "Why Jamaal works the way it does." });

    fetchCms.mockResolvedValueOnce(rawJournal());
    expect((await pages.loadJournalArticles()).seo.title).toBe("Journal — [siteName]");
  });

  it("keeps the not-found page out of search", async () => {
    fetchCms.mockResolvedValueOnce({ siteConfig: rawSite() });
    const { site } = await pages.loadSite();
    expect(pages.notFoundSeo(site)).toMatchObject({ title: "Page not found — [siteName]", noindex: true });
  });

  it("lists the pages for the sitemap in one request", async () => {
    fetchCms.mockResolvedValueOnce({
      siteConfig: { _updatedAt: "2026-10-01T00:00:00Z" },
      homePage: { _updatedAt: "2026-10-02T00:00:00Z", seo: null },
      journalPage: null,
      pressPage: null,
      allContentPages: [],
      allPosts: [],
      allFaqItems: [],
      allDayChapters: [],
    });
    expect(await pages.loadSitemap()).toEqual([{ path: "/", lastmod: "2026-10-02T00:00:00Z" }]);
    expect(fetchCms.mock.calls.at(-1)?.[0]).toBe(queries.SITEMAP_QUERY);
  });

  it("shows the error-reporting note when it is on in the build", async () => {
    fetchCms.mockResolvedValueOnce(rawContent());
    const { page } = await pages.loadContentPage("privacy");
    expect(page.blocks.some((b) => b.type === "note")).toBe(true);
  });

  it("sorts the Journal posts newest first and returns the copy", async () => {
    fetchCms.mockResolvedValueOnce(rawJournal());
    const { page } = await pages.loadJournal();
    expect(page.posts.map((p) => p.slug)).toEqual(["b", "a"]);
    expect(page.copy.author.name).toBe("Fahad Ahmed");
  });

  it("fails the build on a post that is missing required fields", async () => {
    const raw = rawJournal();
    raw.allPosts[0].date = "yesterday";
    fetchCms.mockResolvedValueOnce(raw);
    await expect(pages.loadJournal()).rejects.toThrow("Journal posts in DatoCMS are missing required fields: a");
  });

  it("passes request failures up so the build stops", async () => {
    fetchCms.mockRejectedValueOnce(new Error("DatoCMS request failed: 500"));
    await expect(pages.loadHome()).rejects.toThrow("failed: 500");
  });
});
