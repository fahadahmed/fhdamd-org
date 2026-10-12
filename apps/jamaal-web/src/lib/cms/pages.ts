import { STAGE } from "../../data/stage";
import type { Stage } from "../../data/stage";
import { ERROR_REPORTING_AVAILABLE } from "../errorReporting";
import { toPost } from "../datocms";
import { isPost, sortPosts } from "../journal";
import type { Post } from "../journal";
import { fetchCms } from "./client";
import { ContentError, toContentPage, toHome, toJournalPage, toPress, toSite } from "./mappers";
import type { ContentPageModel, HomeModel, JournalPageModel, PressModel, SiteModel } from "./models";
import { CONTENT_PAGE_QUERY, HOME_QUERY, JOURNAL_QUERY, POSTS_QUERY, PRESS_QUERY, SITE_QUERY } from "./queries";
import type { RawContent, RawHome, RawJournal, RawPress, RawSite } from "./types";

/**
 * One function per page. Each makes a single request for everything the page
 * shows, plus the site settings (the nav, the footer and the contact address),
 * and returns it ready to render with the build's stage already applied.
 */

export interface Page<T> {
  site: SiteModel;
  stage: Stage;
  page: T;
}

export async function loadSite(): Promise<{ site: SiteModel; stage: Stage }> {
  const data = await fetchCms<RawSite>(SITE_QUERY);
  return { site: toSite(data.siteConfig), stage: STAGE };
}

export async function loadHome(): Promise<Page<HomeModel>> {
  const data = await fetchCms<RawHome>(HOME_QUERY);
  return { site: toSite(data.siteConfig), stage: STAGE, page: toHome(data, STAGE) };
}

export async function loadContentPage(key: "privacy" | "terms" | "support"): Promise<Page<ContentPageModel>> {
  const data = await fetchCms<RawContent>(CONTENT_PAGE_QUERY, { key });
  return { site: toSite(data.siteConfig), stage: STAGE, page: toContentPage(data, { errorReporting: ERROR_REPORTING_AVAILABLE }) };
}

export async function loadPress(): Promise<Page<PressModel>> {
  const data = await fetchCms<RawPress>(PRESS_QUERY);
  return { site: toSite(data.siteConfig), stage: STAGE, page: toPress(data, STAGE) };
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
  return { site: toSite(data.siteConfig), stage: STAGE, page: { copy: toJournalPage(data.journalPage), posts: toPosts(data) } };
}

/** Every article with its body, fetched once for all the article pages. */
export async function loadJournalArticles(): Promise<Page<JournalPage>> {
  const data = await fetchCms<RawJournal>(POSTS_QUERY);
  return { site: toSite(data.siteConfig), stage: STAGE, page: { copy: toJournalPage(data.journalPage), posts: toPosts(data) } };
}
