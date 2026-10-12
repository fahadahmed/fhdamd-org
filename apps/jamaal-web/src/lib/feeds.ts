import type { SitemapEntry } from "./cms/sitemap";
import { listTitle } from "./journal";
import type { Post } from "./journal";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

export const xmlEscape = (text: string): string => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** sitemap.xml, as the sitemaps.org protocol describes it. */
export function buildSitemap(origin: string, entries: readonly SitemapEntry[]): string {
  const urls = entries
    .map((e) => `  <url>\n    <loc>${xmlEscape(new URL(e.path, origin).href)}</loc>\n    <lastmod>${xmlEscape(e.lastmod)}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export interface FeedChannel {
  title: string;
  description: string;
  /** The page the feed is about, for example /journal. */
  path: string;
  /** Where the feed itself is served. */
  selfPath: string;
}

/** RSS 2.0 for the Journal: newest first, each item linking to its article. */
export function buildRss(origin: string, channel: FeedChannel, posts: readonly Post[]): string {
  const url = (path: string) => new URL(path, origin).href;
  const items = posts
    .map((post) => {
      const link = url(`/journal/${post.slug}`);
      return `    <item>
      <title>${xmlEscape(listTitle(post))}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${xmlEscape(post.category)}</category>
      <description>${xmlEscape(post.excerpt)}</description>
    </item>`;
    })
    .join("\n");
  const newest = posts[0] ? new Date(`${posts[0].date}T00:00:00Z`).toUTCString() : new Date(0).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(channel.title)}</title>
    <link>${xmlEscape(url(channel.path))}</link>
    <description>${xmlEscape(channel.description)}</description>
    <language>en</language>
    <lastBuildDate>${newest}</lastBuildDate>
    <atom:link href="${xmlEscape(url(channel.selfPath))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
