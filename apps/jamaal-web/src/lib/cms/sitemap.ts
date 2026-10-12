import type { RawSitemap } from "./types";

export interface SitemapEntry {
  /** A path on the site, without a trailing slash: "/" or "/journal/why-i-built-jamaal". */
  path: string;
  /** ISO timestamp of the last change to anything the page shows. */
  lastmod: string;
}

const latest = (stamps: (string | undefined | null)[]): string => {
  const valid = stamps.filter((s): s is string => Boolean(s));
  return valid.reduce((a, b) => (new Date(b) > new Date(a) ? b : a), valid[0] ?? "");
};

/**
 * The pages to list for search engines, with when each last changed. A page changes when its own
 * record changes or when the site settings (the nav and footer) do, and the home and support pages
 * also show the FAQ and the day story. Anything an editor has marked "hide from search" is left out.
 */
export function toSitemapEntries(raw: RawSitemap): SitemapEntry[] {
  const site = raw.siteConfig?._updatedAt;
  const entries: (SitemapEntry | null)[] = [];
  const add = (path: string, record: { _updatedAt: string; seo: { noIndex: boolean | null } | null } | null, extra: (string | undefined)[] = []) => {
    if (!record || record.seo?.noIndex) return;
    entries.push({ path, lastmod: latest([site, record._updatedAt, ...extra]) });
  };

  const faq = raw.allFaqItems.map((f) => f._updatedAt);
  const chapters = raw.allDayChapters.map((c) => c._updatedAt);
  const posts = raw.allPosts.map((p) => p._updatedAt);

  add("/", raw.homePage, [...faq, ...chapters]);
  add("/journal", raw.journalPage, posts);
  for (const post of raw.allPosts) add(`/journal/${post.slug}`, post, [raw.journalPage?._updatedAt]);
  add("/press", raw.pressPage);
  for (const page of raw.allContentPages) add(`/${page.pageKey}`, page, page.pageKey === "support" ? faq : []);
  return entries.filter((e): e is SitemapEntry => e !== null);
}
