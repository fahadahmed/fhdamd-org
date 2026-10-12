import type { APIRoute } from "astro";
import { loadJournal } from "../../lib/cms/pages";
import { buildRss } from "../../lib/feeds";

export const GET: APIRoute = async ({ site }) => {
  const { site: settings, page } = await loadJournal();
  const channel = { title: `${settings.name} ${page.copy.eyebrow}`, description: page.copy.lede, path: "/journal", selfPath: "/journal/rss.xml" };
  return new Response(buildRss(site!.origin, channel, page.posts), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
