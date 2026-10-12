import type { APIRoute } from "astro";
import { loadSitemap } from "../lib/cms/pages";
import { buildSitemap } from "../lib/feeds";

export const GET: APIRoute = async ({ site }) =>
  new Response(buildSitemap(site!.origin, await loadSitemap()), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
