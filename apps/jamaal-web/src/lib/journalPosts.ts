import { fetchPosts } from "./datocms";
import { isPost, sortPosts } from "./journal";
import type { Post } from "./journal";

/** The three articles that ship with the site; used when DatoCMS is not configured. */
const seeds = import.meta.glob<Post>("../content/journal/*.json", { eager: true, import: "default" });

let cache: Promise<Post[]> | undefined;

/** Where the posts come from: DatoCMS with a token, the bundled articles without. Cached for the build. */
export function loadPosts(): Promise<Post[]> {
  cache ??= (async () => {
    const token = import.meta.env.DATOCMS_API_TOKEN;
    const posts = token ? await fetchPosts(token, import.meta.env.DATOCMS_ENVIRONMENT) : Object.values(seeds);
    const invalid = (posts as unknown[]).filter((post) => !isPost(post)) as { slug?: string }[];
    if (invalid.length) throw new Error(`Journal posts missing required fields: ${invalid.map((p) => p?.slug ?? "(no slug)").join(", ")}`);
    return sortPosts(posts);
  })();
  return cache;
}
