import { listTitle } from "../journal";
import type { Post } from "../journal";
import type { SeoModel, ShareImage, SiteModel } from "./models";
import type { RawSeo } from "./types";

/** The size a share image is shown at (Open Graph, X, LinkedIn). */
export const SHARE_SIZE = { width: 1200, height: 630 } as const;

/** The deep blue of the brand, for the canvas behind an image that is not the right shape. */
const CANVAS = "0c4767";

/** Used when neither the page nor the site settings in DatoCMS have a share image. A file in public/. */
export const BUILT_IN_SHARE_IMAGE: ShareImage = { url: "/og-image.png", ...SHARE_SIZE, alt: "" };

/**
 * A DatoCMS image sized for sharing. `crop` fills the frame (a picture someone chose for it);
 * `canvas` fits the whole image on a brand-blue frame, for a tall phone screenshot that would
 * lose most of itself if it were cropped.
 */
export function shareImageUrl(url: string, how: "crop" | "canvas"): string {
  const base = `${url.split("?")[0]}?auto=format&w=${SHARE_SIZE.width}&h=${SHARE_SIZE.height}`;
  return how === "crop" ? `${base}&fit=crop` : `${base}&fit=fill&fill=solid&fill-color=${CANVAS}`;
}

export interface SeoFallback {
  title: string;
  description: string;
  noindex?: boolean;
  /** Used when the page has no share image of its own, for example an article's cover. */
  image?: ShareImage;
}

const clean = (value: string | null | undefined) => value?.trim() || undefined;

/**
 * What a page puts in its <head>: what the editor wrote in "Search and sharing" in
 * DatoCMS, with anything left empty filled from the page itself and then the site settings.
 */
export function resolveSeo(raw: RawSeo | null | undefined, fallback: SeoFallback, site: SiteModel): SeoModel {
  const own = raw?.image
    ? { url: shareImageUrl(raw.image.url, "crop"), ...SHARE_SIZE, alt: clean(raw.image.alt) ?? fallback.image?.alt ?? site.share.alt }
    : undefined;
  return {
    title: clean(raw?.title) ?? fallback.title,
    description: clean(raw?.description) ?? fallback.description,
    image: own ?? fallback.image ?? site.share.image ?? { ...BUILT_IN_SHARE_IMAGE, alt: site.share.alt },
    twitterCard: raw?.twitterCard === "summary" ? "summary" : "summary_large_image",
    noindex: Boolean(raw?.noIndex || fallback.noindex),
  };
}

/** "Page — Site" for a page that has no title of its own in DatoCMS. A title that already names the site is left alone. */
export const pageTitle = (title: string, site: SiteModel): string =>
  title.toLowerCase().includes(site.name.toLowerCase()) ? title : `${title} — ${site.name}`;

/** An article's head: its own settings, else its excerpt and its cover on a brand-blue frame. */
export function articleSeo(post: Post, site: SiteModel): SeoModel {
  const title = listTitle(post);
  return resolveSeo(
    post.seo,
    {
      title: pageTitle(title, site),
      description: post.excerpt,
      image: post.cover ? { url: shareImageUrl(post.cover.src, "canvas"), ...SHARE_SIZE, alt: post.cover.alt || title } : undefined,
    },
    site,
  );
}
