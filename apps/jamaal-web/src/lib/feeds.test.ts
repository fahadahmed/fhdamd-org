import { describe, expect, it } from "vitest";
import { buildRss, buildSitemap, xmlEscape } from "./feeds";
import type { Post } from "./journal";

const post = (over: Partial<Post> = {}): Post => ({ slug: "a-b", title: "Tom & Jerry's", accent: "<planner>", category: "Story", date: "2026-10-08", readMinutes: 3, excerpt: 'He said "hi" & left.', lede: "l", body: [], ...over });

describe("xmlEscape", () => {
  it("escapes the five characters XML cares about", () => {
    expect(xmlEscape(`<a href="x">Tom & 'Jerry'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;");
  });
});

describe("buildSitemap", () => {
  const xml = buildSitemap("https://jamaal.app", [
    { path: "/", lastmod: "2026-10-12T16:00:00+11:00" },
    { path: "/journal/a-b", lastmod: "2026-10-08T10:00:00+11:00" },
  ]);

  it("lists each address in full with its date", () => {
    expect(xml).toContain("<loc>https://jamaal.app/</loc>");
    expect(xml).toContain("<loc>https://jamaal.app/journal/a-b</loc>");
    expect(xml).toContain("<lastmod>2026-10-08T10:00:00+11:00</lastmod>");
  });

  it("is a urlset in the sitemaps.org namespace", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });
});

describe("buildRss", () => {
  const channel = { title: "Jamaal Journal", description: "Notes & more", path: "/journal", selfPath: "/journal/rss.xml" };

  it("describes the channel and points at itself", () => {
    const xml = buildRss("https://jamaal.app", channel, [post()]);
    expect(xml).toContain("<title>Jamaal Journal</title>");
    expect(xml).toContain("<description>Notes &amp; more</description>");
    expect(xml).toContain("<link>https://jamaal.app/journal</link>");
    expect(xml).toContain('<atom:link href="https://jamaal.app/journal/rss.xml" rel="self" type="application/rss+xml" />');
  });

  it("lists each article with its link, date, category and excerpt, escaped", () => {
    const xml = buildRss("https://jamaal.app", channel, [post()]);
    expect(xml).toContain("<title>Tom &amp; Jerry&apos;s &lt;planner&gt;</title>");
    expect(xml).toContain("<link>https://jamaal.app/journal/a-b</link>");
    expect(xml).toContain('<guid isPermaLink="true">https://jamaal.app/journal/a-b</guid>');
    expect(xml).toContain("<pubDate>Thu, 08 Oct 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<category>Story</category>");
    expect(xml).toContain("<description>He said &quot;hi&quot; &amp; left.</description>");
    expect(xml).toContain("<lastBuildDate>Thu, 08 Oct 2026 00:00:00 GMT</lastBuildDate>");
  });

  it("still builds with no articles", () => {
    const xml = buildRss("https://jamaal.app", channel, []);
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });
});
