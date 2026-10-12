// Checks the built site's SEO: run after `astro build` as `node scripts/seo-check.mjs dist`.
// Exits 1 and lists every problem, so a bad title, a missing canonical or a page that drifted
// out of the sitemap can't be deployed unnoticed.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = "https://jamaal.app";

export const LIMITS = { titleMin: 10, titleMax: 70, descriptionMin: 50, descriptionMax: 200 };

const decode = (text) => text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** The address a built file is served at: dist/journal/index.html is /journal. */
export function pathOf(file) {
  const clean = file.replace(/\\/g, "/").replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "").replace(/\/$/, "");
  return `/${clean}`.replace(/\/+/g, "/");
}

function meta(head, attr, name) {
  const tag = head.match(new RegExp(`<meta[^>]*\\b${attr}="${name}"[^>]*>`, "i"))?.[0];
  const value = tag?.match(/\bcontent="([^"]*)"/i)?.[1];
  return value === undefined ? undefined : decode(value);
}

/** What one page's head and body say, ready to check. */
export function readPage(file, html) {
  const head = html.slice(0, html.indexOf("</head>"));
  const body = html.slice(html.indexOf("</head>"));
  return {
    file,
    path: pathOf(file),
    title: decode(head.match(/<title>([^<]*)<\/title>/i)?.[1] ?? ""),
    description: meta(head, "name", "description"),
    canonical: head.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i)?.[1],
    robots: meta(head, "name", "robots") ?? "",
    og: Object.fromEntries(["title", "description", "url", "image", "image:alt", "type"].map((k) => [k, meta(head, "property", `og:${k}`)])),
    twitterCard: meta(head, "name", "twitter:card"),
    jsonLd: [...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]),
    h1Count: (body.match(/<h1[\s>]/g) ?? []).length,
    imagesWithoutAlt: (body.match(/<img\b(?![^>]*\balt=)[^>]*>/g) ?? []).length,
  };
}

/** Every problem on one page. */
export function checkPage(page) {
  const problems = [];
  const add = (message) => problems.push(`${page.path}: ${message}`);
  const hidden = /noindex/i.test(page.robots);

  if (page.h1Count !== 1) add(`has ${page.h1Count} <h1> elements, expected 1`);
  if (page.imagesWithoutAlt) add(`${page.imagesWithoutAlt} <img> without an alt attribute`);

  if (!page.title) add("has no <title>");
  else if (!hidden && (page.title.length < LIMITS.titleMin || page.title.length > LIMITS.titleMax)) add(`title is ${page.title.length} characters (${LIMITS.titleMin} to ${LIMITS.titleMax}): "${page.title}"`);

  const d = page.description;
  if (!d) add("has no meta description");
  else if (!hidden && (d.length < LIMITS.descriptionMin || d.length > LIMITS.descriptionMax)) add(`description is ${d.length} characters (${LIMITS.descriptionMin} to ${LIMITS.descriptionMax})`);

  if (!hidden) {
    const expected = `${ORIGIN}${page.path === "/" ? "/" : page.path}`;
    if (!page.canonical) add("has no canonical link");
    else if (page.canonical !== expected) add(`canonical is ${page.canonical}, expected ${expected}`);
  }
  if (hidden && page.canonical) add("is hidden from search but declares a canonical link");

  for (const key of ["title", "description", "url", "image", "image:alt"]) if (!page.og[key]) add(`has no og:${key}`);
  if (page.og.image && !/^https:\/\//.test(page.og.image)) add(`og:image is not an absolute https address: ${page.og.image}`);
  if (page.og.title && page.title && page.og.title !== page.title) add("og:title differs from the <title>");
  if (!page.twitterCard) add("has no twitter:card");

  page.jsonLd.forEach((raw, i) => {
    try {
      const data = JSON.parse(raw);
      if (!data["@context"] || !data["@type"]) add(`structured data #${i + 1} has no @context or @type`);
    } catch {
      add(`structured data #${i + 1} is not valid JSON`);
    }
  });
  return problems;
}

/** Problems across the whole site: duplicate titles or descriptions, and a sitemap that doesn't match the indexable pages. */
export function checkSite(pages, sitemapXml) {
  const problems = pages.flatMap(checkPage);
  const indexable = pages.filter((p) => !/noindex/i.test(p.robots));

  for (const field of ["title", "description"]) {
    const seen = new Map();
    for (const p of indexable) {
      const value = p[field];
      if (!value) continue;
      if (seen.has(value)) problems.push(`${p.path}: ${field} is the same as ${seen.get(value)}'s`);
      else seen.set(value, p.path);
    }
  }

  if (sitemapXml === undefined) problems.push("there is no sitemap.xml");
  else {
    const listed = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    const wanted = indexable.map((p) => `${ORIGIN}${p.path}`).sort();
    for (const url of wanted) if (!listed.includes(url)) problems.push(`${url} is indexable but not in sitemap.xml`);
    for (const url of listed) if (!wanted.includes(url)) problems.push(`${url} is in sitemap.xml but is not an indexable page`);
  }
  return problems;
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "_astro" ? [] : htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] ?? "dist";
  const pages = htmlFiles(dir).map((f) => readPage(relative(dir, f), readFileSync(f, "utf8")));
  let sitemap;
  try {
    sitemap = readFileSync(join(dir, "sitemap.xml"), "utf8");
  } catch {
    /* reported by checkSite */
  }
  const problems = checkSite(pages, sitemap);
  if (problems.length) {
    console.error(`SEO check failed (${problems.length}):\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`SEO check passed: ${pages.length} pages, ${pages.filter((p) => !/noindex/i.test(p.robots)).length} indexable.`);
}
