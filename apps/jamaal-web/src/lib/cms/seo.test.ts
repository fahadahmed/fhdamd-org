import { describe, expect, it } from "vitest";
import { rawSite } from "./fixtures";
import { toSite } from "./mappers";
import { BUILT_IN_SHARE_IMAGE, articleSeo, pageTitle, resolveSeo, shareImageUrl } from "./seo";
import type { Post } from "../journal";

const site = toSite(rawSite({ siteName: "Jamaal", shareImageAlt: "The default picture" }));
const fallback = { title: "Journal — Jamaal", description: "Why Jamaal works the way it does." };

describe("shareImageUrl", () => {
  it("crops to the share size, dropping any parameters it already had", () => {
    expect(shareImageUrl("https://www.datocms-assets.com/1/a.png?w=640", "crop")).toBe("https://www.datocms-assets.com/1/a.png?auto=format&w=1200&h=630&fit=crop");
  });

  it("can fit the whole picture on a brand-blue frame", () => {
    expect(shareImageUrl("https://www.datocms-assets.com/1/a.png", "canvas")).toBe("https://www.datocms-assets.com/1/a.png?auto=format&w=1200&h=630&fit=fill&fill=solid&fill-color=0c4767");
  });
});

describe("resolveSeo", () => {
  it("uses the page's own text and falls back to the page and the site where it is empty", () => {
    expect(resolveSeo(null, fallback, site)).toMatchObject({ title: "Journal — Jamaal", description: "Why Jamaal works the way it does.", noindex: false, twitterCard: "summary_large_image" });
    expect(resolveSeo({ title: "  ", description: "" }, fallback, site)).toMatchObject({ title: "Journal — Jamaal", description: "Why Jamaal works the way it does." });
    expect(resolveSeo({ title: "Custom", description: "Custom text" }, fallback, site)).toMatchObject({ title: "Custom", description: "Custom text" });
  });

  it("picks the share image from the page, then the fallback, then the site settings, then the built-in one", () => {
    const own = { url: "https://www.datocms-assets.com/1/own.png", width: 800, height: 400, alt: "Its own" };
    expect(resolveSeo({ image: own }, fallback, site).image).toEqual({ url: "https://www.datocms-assets.com/1/own.png?auto=format&w=1200&h=630&fit=crop", width: 1200, height: 630, alt: "Its own" });

    const cover = { url: "https://x/cover.png", width: 1200, height: 630, alt: "Cover" };
    expect(resolveSeo(null, { ...fallback, image: cover }, site).image).toBe(cover);

    const withSiteImage = toSite(rawSite({ shareImage: { url: "https://www.datocms-assets.com/1/site.png", width: 1, height: 1, alt: null } }));
    expect(resolveSeo(null, fallback, withSiteImage).image.url).toBe("https://www.datocms-assets.com/1/site.png?auto=format&w=1200&h=630&fit=crop");

    expect(resolveSeo(null, fallback, site).image).toEqual({ ...BUILT_IN_SHARE_IMAGE, alt: "The default picture" });
  });

  it("describes the picture, from the picture, then the fallback, then the site", () => {
    expect(resolveSeo({ image: { url: "https://x/a.png", width: 1, height: 1, alt: null } }, fallback, site).image.alt).toBe("The default picture");
    expect(resolveSeo({ image: { url: "https://x/a.png", width: 1, height: 1, alt: null } }, { ...fallback, image: { url: "u", width: 1, height: 1, alt: "From the cover" } }, site).image.alt).toBe("From the cover");
  });

  it("hides a page from search when either the editor or the page asks", () => {
    expect(resolveSeo({ noIndex: true }, fallback, site).noindex).toBe(true);
    expect(resolveSeo(null, { ...fallback, noindex: true }, site).noindex).toBe(true);
    expect(resolveSeo({ noIndex: false }, fallback, site).noindex).toBe(false);
  });

  it("allows a small summary card, and otherwise uses the large one", () => {
    expect(resolveSeo({ twitterCard: "summary" }, fallback, site).twitterCard).toBe("summary");
    expect(resolveSeo({ twitterCard: "player" }, fallback, site).twitterCard).toBe("summary_large_image");
  });
});

describe("pageTitle and articleSeo", () => {
  const post: Post = { slug: "a", title: "Your first Night Planning,", accent: "in five minutes.", category: "How-to", date: "2026-10-10", readMinutes: 4, excerpt: "What each step is for.", lede: "l", body: [], cover: { src: "https://www.datocms-assets.com/1/cover.png", alt: "Cover alt" } };

  it("ends a title with the site name, unless the title already has it", () => {
    expect(pageTitle("Press kit", site)).toBe("Press kit — Jamaal");
    expect(pageTitle("Why I built Jamaal", site)).toBe("Why I built Jamaal");
  });

  it("uses the excerpt, and the cover on a brand-blue frame", () => {
    expect(articleSeo(post, site)).toMatchObject({
      title: "Your first Night Planning, in five minutes — Jamaal",
      description: "What each step is for.",
      image: { url: "https://www.datocms-assets.com/1/cover.png?auto=format&w=1200&h=630&fit=fill&fill=solid&fill-color=0c4767", alt: "Cover alt" },
    });
  });

  it("uses the title for the picture's description when the cover has none, and the default picture without a cover", () => {
    expect(articleSeo({ ...post, cover: { src: "https://x/c.png", alt: "" } }, site).image.alt).toBe("Your first Night Planning, in five minutes");
    expect(articleSeo({ ...post, cover: undefined }, site).image.url).toBe("/og-image.png");
  });

  it("lets the editor override it", () => {
    expect(articleSeo({ ...post, seo: { title: "Mine", noIndex: true } }, site)).toMatchObject({ title: "Mine", noindex: true });
  });
});
