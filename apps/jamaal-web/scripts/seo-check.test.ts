import { describe, expect, it } from "vitest";
import { checkPage, checkSite, pathOf, readPage } from "./seo-check.mjs";

const TITLE = "Press kit — Jamaal";
const DESCRIPTION = "Facts, a short description, the app icon and screenshots for writing about Jamaal.";

/** A page that passes, with anything a test wants to break replaced. */
function html(over: Record<string, string> = {}, body = '<h1>Press</h1><img src="a.png" alt="An icon">') {
  const t = {
    title: `<title>${TITLE}</title>`,
    description: `<meta name="description" content="${DESCRIPTION}">`,
    canonical: '<link rel="canonical" href="https://jamaal.app/press">',
    robots: '<meta name="robots" content="index, follow">',
    ogTitle: `<meta property="og:title" content="${TITLE}">`,
    ogDescription: `<meta property="og:description" content="${DESCRIPTION}">`,
    ogUrl: '<meta property="og:url" content="https://jamaal.app/press">',
    ogImage: '<meta property="og:image" content="https://jamaal.app/og-image.png">',
    ogAlt: '<meta property="og:image:alt" content="The Jamaal icon">',
    twitter: '<meta name="twitter:card" content="summary_large_image">',
    jsonLd: '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>',
    ...over,
  };
  return `<!doctype html><html><head>${Object.values(t).join("")}</head><body>${body}</body></html>`;
}

const check = (over?: Record<string, string>, body?: string, file = "press/index.html") => checkPage(readPage(file, html(over, body)));

describe("pathOf", () => {
  it("maps a built file to the address it is served at", () => {
    expect(pathOf("index.html")).toBe("/");
    expect(pathOf("journal/index.html")).toBe("/journal");
    expect(pathOf("journal/why-i-built-jamaal/index.html")).toBe("/journal/why-i-built-jamaal");
    expect(pathOf("404.html")).toBe("/404");
    expect(pathOf("press\\index.html")).toBe("/press");
  });
});

describe("checkPage", () => {
  it("passes a complete page", () => {
    expect(check()).toEqual([]);
  });

  it("wants exactly one h1 and an alt on every image", () => {
    expect(check({}, "<p>none</p>")).toEqual(["/press: has 0 <h1> elements, expected 1"]);
    expect(check({}, "<h1>a</h1><h1>b</h1>")).toEqual(["/press: has 2 <h1> elements, expected 1"]);
    expect(check({}, '<h1>a</h1><img src="x.png"><img src="y.png" alt="">')).toEqual(["/press: 1 <img> without an alt attribute"]);
  });

  it("wants a title and a description of a sensible length", () => {
    expect(check({ title: "" })).toContain("/press: has no <title>");
    expect(check({ title: "<title>Hi</title>" })[0]).toContain("title is 2 characters");
    expect(check({ title: `<title>${"x".repeat(71)}</title>`, ogTitle: `<meta property="og:title" content="${"x".repeat(71)}">` })[0]).toContain("title is 71 characters");
    expect(check({ description: "" })).toContain("/press: has no meta description");
    expect(check({ description: '<meta name="description" content="Too short.">' })[0]).toContain("description is 10 characters");
  });

  it("decodes entities before counting", () => {
    const apostrophe = "Qur&#39;an and dhikr — a guide for Muslims";
    expect(check({ title: `<title>${apostrophe}</title>`, ogTitle: `<meta property="og:title" content="${apostrophe}">` })).toEqual([]);
  });

  it("wants the canonical to be this page's address, without a trailing slash", () => {
    expect(check({ canonical: "" })).toContain("/press: has no canonical link");
    expect(check({ canonical: '<link rel="canonical" href="https://jamaal.app/press/">' })).toEqual(["/press: canonical is https://jamaal.app/press/, expected https://jamaal.app/press"]);
    expect(checkPage(readPage("index.html", html({ canonical: '<link rel="canonical" href="https://jamaal.app/">' })))).toEqual([]);
  });

  it("wants the share tags", () => {
    expect(check({ ogImage: "" })).toContain("/press: has no og:image");
    expect(check({ ogAlt: "" })).toContain("/press: has no og:image:alt");
    expect(check({ ogImage: '<meta property="og:image" content="/og-image.png">' })[0]).toContain("not an absolute https address");
    expect(check({ ogTitle: '<meta property="og:title" content="Something else">' })).toContain("/press: og:title differs from the <title>");
    expect(check({ twitter: "" })).toContain("/press: has no twitter:card");
  });

  it("wants structured data to be valid JSON with a type", () => {
    expect(check({ jsonLd: '<script type="application/ld+json">{nope</script>' })).toEqual(["/press: structured data #1 is not valid JSON"]);
    expect(check({ jsonLd: '<script type="application/ld+json">{"a":1}</script>' })).toEqual(["/press: structured data #1 has no @context or @type"]);
  });

  it("lets a hidden page skip the length rules and the canonical, but not declare one", () => {
    const hidden = { robots: '<meta name="robots" content="noindex, nofollow">', title: "<title>404</title>", ogTitle: '<meta property="og:title" content="404">', canonical: "" };
    expect(check(hidden, "<h1>Nothing</h1>", "404.html")).toEqual([]);
    expect(check({ ...hidden, canonical: '<link rel="canonical" href="https://jamaal.app/404">' }, "<h1>Nothing</h1>", "404.html")).toEqual(["/404: is hidden from search but declares a canonical link"]);
  });
});

describe("checkSite", () => {
  const press = readPage("press/index.html", html());
  const terms = readPage(
    "terms/index.html",
    html({
      title: "<title>Terms — Jamaal</title>",
      ogTitle: '<meta property="og:title" content="Terms — Jamaal">',
      description: '<meta name="description" content="The terms of the Jamaal subscription and of using the app, in plain words.">',
      canonical: '<link rel="canonical" href="https://jamaal.app/terms">',
    }),
  );
  const sitemap = (...paths: string[]) => `<urlset>${paths.map((p) => `<url><loc>https://jamaal.app${p}</loc></url>`).join("")}</urlset>`;

  it("passes when every indexable page is in the sitemap, and only those", () => {
    expect(checkSite([press, terms], sitemap("/press", "/terms"))).toEqual([]);
  });

  it("flags duplicate titles and descriptions", () => {
    const twin = readPage("terms/index.html", html({ canonical: '<link rel="canonical" href="https://jamaal.app/terms">' }));
    const problems = checkSite([press, twin], sitemap("/press", "/terms"));
    expect(problems).toContain("/terms: title is the same as /press's");
    expect(problems).toContain("/terms: description is the same as /press's");
  });

  it("flags a sitemap that is missing a page, lists one that should not be there, or does not exist", () => {
    expect(checkSite([press, terms], sitemap("/press"))).toEqual(["https://jamaal.app/terms is indexable but not in sitemap.xml"]);
    expect(checkSite([press], sitemap("/press", "/old"))).toEqual(["https://jamaal.app/old is in sitemap.xml but is not an indexable page"]);
    expect(checkSite([press], undefined)).toEqual(["there is no sitemap.xml"]);
  });

  it("keeps hidden pages out of the sitemap", () => {
    const hidden = readPage("404.html", html({ robots: '<meta name="robots" content="noindex, nofollow">', canonical: "" }, "<h1>Nothing</h1>"));
    expect(checkSite([press, hidden], sitemap("/press"))).toEqual([]);
    expect(checkSite([press, hidden], sitemap("/press", "/404"))).toEqual(["https://jamaal.app/404 is in sitemap.xml but is not an indexable page"]);
  });
});
