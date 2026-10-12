import { describe, expect, it } from "vitest";
import { toSitemapEntries } from "./sitemap";
import type { RawSitemap } from "./types";

const at = (day: string) => `2026-10-${day}T10:00:00+11:00`;
const raw = (): RawSitemap => ({
  siteConfig: { _updatedAt: at("01") },
  homePage: { _updatedAt: at("02"), seo: null },
  journalPage: { _updatedAt: at("03"), seo: null },
  pressPage: { _updatedAt: at("04"), seo: { noIndex: false } },
  allContentPages: [
    { pageKey: "privacy", _updatedAt: at("05"), seo: null },
    { pageKey: "support", _updatedAt: at("06"), seo: null },
  ],
  allPosts: [
    { slug: "a", _updatedAt: at("07"), seo: null },
    { slug: "b", _updatedAt: at("08"), seo: { noIndex: true } },
  ],
  allFaqItems: [{ _updatedAt: at("15") }],
  allDayChapters: [{ _updatedAt: at("20") }],
});

describe("toSitemapEntries", () => {
  it("lists every page without a trailing slash", () => {
    expect(toSitemapEntries(raw()).map((e) => e.path)).toEqual(["/", "/journal", "/journal/a", "/press", "/privacy", "/support"]);
  });

  it("leaves out anything marked hide from search", () => {
    expect(toSitemapEntries(raw()).some((e) => e.path === "/journal/b")).toBe(false);
    const hidden = raw();
    hidden.pressPage!.seo = { noIndex: true };
    expect(toSitemapEntries(hidden).some((e) => e.path === "/press")).toBe(false);
  });

  it("dates a page by the latest change to anything it shows", () => {
    const byPath = Object.fromEntries(toSitemapEntries(raw()).map((e) => [e.path, e.lastmod]));
    expect(byPath["/"]).toBe(at("20")); // the day story
    expect(byPath["/support"]).toBe(at("15")); // the FAQ
    expect(byPath["/privacy"]).toBe(at("05"));
    expect(byPath["/journal"]).toBe(at("08")); // the newest article
    expect(byPath["/journal/a"]).toBe(at("07"));
  });

  it("moves every page forward when the site settings change", () => {
    const changed = raw();
    changed.siteConfig = { _updatedAt: at("25") };
    expect(toSitemapEntries(changed).every((e) => e.lastmod === at("25"))).toBe(true);
  });

  it("skips records that do not exist", () => {
    const sparse = raw();
    sparse.pressPage = null;
    sparse.siteConfig = null;
    expect(toSitemapEntries(sparse).some((e) => e.path === "/press")).toBe(false);
    expect(toSitemapEntries(sparse).find((e) => e.path === "/privacy")?.lastmod).toBe(at("05"));
  });
});
