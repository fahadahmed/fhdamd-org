import { STAGE } from "../../data/stage";
import type { Stage } from "../../data/stage";
import { ERROR_REPORTING_AVAILABLE } from "../errorReporting";
import { toPost } from "../datocms";
import { isPost, sortPosts } from "../journal";
import type { Post } from "../journal";
import { fetchCms } from "./client";
import { ContentError, toContentPage, toHome, toJournalPage, toPress, toSite } from "./mappers";
import type { ContentPageModel, HomeModel, JournalPageModel, PressModel, SeoModel, SiteModel } from "./models";
import { toSitemapEntries } from "./sitemap";
import type { SitemapEntry } from "./sitemap";
import { pageTitle, resolveSeo } from "./seo";
import { CONTENT_PAGE_QUERY, HOME_QUERY, JOURNAL_QUERY, POSTS_QUERY, PRESS_QUERY, SITE_QUERY, SITEMAP_QUERY } from "./queries";
import type { RawContent, RawHome, RawJournal, RawPress, RawSite, RawSitemap } from "./types";

/**
 * One function per page. Each makes a single request for everything the page
 * shows, plus the site settings (the nav, the footer and the contact address),
 * and returns it ready to render with the build's stage already applied.
 */

export interface Page<T> {
  site: SiteModel;
  stage: Stage;
  page: T;
  /** What the page puts in its <head>. */
  seo: SeoModel;
}

export async function loadSite(): Promise<{ site: SiteModel; stage: Stage }> {
  const data = await fetchCms<RawSite>(SITE_QUERY);
  return { site: toSite(data.siteConfig), stage: STAGE };
}

/** The "page not found" page: it has no record of its own, so its words are fixed and it is kept out of search. */
export function notFoundSeo(site: SiteModel): SeoModel {
  return resolveSeo(null, { title: pageTitle("Page not found", site), description: site.description, noindex: true }, site);
}

export async function loadHome(): Promise<Page<HomeModel>> {
  const data = await fetchCms<RawHome>(HOME_QUERY);
  const site = toSite(data.siteConfig);
  const page = toHome(data, STAGE);
  const { hero } = page;
  const seo = resolveSeo(data.homePage?.seo, { title: `${site.name} — ${hero.title} ${hero.titleLine2} ${hero.accent}`, description: site.description }, site);
  return { site, stage: STAGE, page, seo };
}

export async function loadContentPage(key: "privacy" | "terms" | "support"): Promise<Page<ContentPageModel>> {
  const data = await fetchCms<RawContent>(CONTENT_PAGE_QUERY, { key });
  const site = toSite(data.siteConfig);
  const page = toContentPage(data, { errorReporting: ERROR_REPORTING_AVAILABLE });
  const seo = resolveSeo(data.contentPage?.seo, { title: pageTitle(page.eyebrow, site), description: page.description }, site);
  return { site, stage: STAGE, page, seo };
}

export async function loadPress(): Promise<Page<PressModel>> {
  const data = await fetchCms<RawPress>(PRESS_QUERY);
  const site = toSite(data.siteConfig);
  const page = toPress(data, STAGE);
  const seo = resolveSeo(data.pressPage?.seo, { title: pageTitle(page.eyebrow, site), description: page.intro }, site);
  return { site, stage: STAGE, page, seo };
}

export interface JournalPage {
  copy: JournalPageModel;
  posts: Post[];
}

function toPosts(raw: RawJournal): Post[] {
  const posts = raw.allPosts.map(toPost);
  const invalid = (posts as unknown[]).filter((post) => !isPost(post)) as { slug?: string }[];
  if (invalid.length) throw new ContentError(`Journal posts in DatoCMS are missing required fields: ${invalid.map((p) => p?.slug ?? "(no slug)").join(", ")}`);
  return sortPosts(posts);
}

/** The Journal index. The list needs no article bodies, so none are fetched. */
export async function loadJournal(): Promise<Page<JournalPage>> {
  const data = await fetchCms<RawJournal>(JOURNAL_QUERY);
  const site = toSite(data.siteConfig);
  const copy = toJournalPage(data.journalPage);
  const seo = resolveSeo(data.journalPage?.seo, { title: pageTitle(copy.eyebrow, site), description: copy.lede }, site);
  return { site, stage: STAGE, page: { copy, posts: toPosts(data) }, seo };
}

/** Every article with its body, fetched once for all the article pages. */
export async function loadJournalArticles(): Promise<Page<JournalPage>> {
  const data = await fetchCms<RawJournal>(POSTS_QUERY);
  const site = toSite(data.siteConfig);
  const copy = toJournalPage(data.journalPage);
  // Each article works out its own head (see articleSeo); this one is the Journal's, for the pages that share it.
  const seo = resolveSeo(data.journalPage?.seo, { title: pageTitle(copy.eyebrow, site), description: copy.lede }, site);
  return { site, stage: STAGE, page: { copy, posts: toPosts(data) }, seo };
}

/** Every page worth listing for search engines, in one request. */
export async function loadSitemap(): Promise<SitemapEntry[]> {
  return toSitemapEntries(await fetchCms<RawSitemap>(SITEMAP_QUERY));
}
