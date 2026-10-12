import { describe, expect, it, vi } from "vitest";
import { fetchPosts, inlineHtml, safeHref, structuredTextToBlocks, toPost } from "./datocms";

const span = (value: string, marks?: string[]) => ({ type: "span", value, marks });
const paragraph = (...children: unknown[]) => ({ type: "paragraph", children });
const doc = (...children: unknown[]) => ({ document: { type: "root", children } }) as never;

describe("safeHref", () => {
  it.each(["https://example.com", "http://example.com", "mailto:a@b.co", "/journal"])("allows %s", (url) => expect(safeHref(url)).toBe(url));
  it.each(["javascript:alert(1)", "data:text/html,x", "//evil.example", undefined, ""])("drops %s", (url) => expect(safeHref(url)).toBeUndefined());
});

describe("inlineHtml", () => {
  it("escapes text and keeps bold and italic", () => {
    expect(inlineHtml([span("a < b & "), span("bold", ["strong"]), span(" and "), span("italic", ["emphasis"]), span("both", ["strong", "emphasis"])])).toBe(
      "a &lt; b &amp; <strong>bold</strong> and <em>italic</em><em><strong>both</strong></em>",
    );
  });

  it("keeps safe links and unwraps unsafe ones", () => {
    expect(inlineHtml([{ type: "link", url: "https://example.com/a?b=1&c=2", children: [span("read")] }])).toBe('<a href="https://example.com/a?b=1&amp;c=2">read</a>');
    expect(inlineHtml([{ type: "link", url: "javascript:alert(1)", children: [span("read")] }])).toBe("read");
  });

  it("skips nodes it does not know, keeping their text", () => {
    expect(inlineHtml([{ type: "inlineItem", children: [span("x")] } as never])).toBe("x");
    expect(inlineHtml(undefined)).toBe("");
  });
});

describe("structuredTextToBlocks", () => {
  it("turns paragraphs, headings and empty paragraphs", () => {
    const blocks = structuredTextToBlocks(
      doc({ type: "heading", level: 2, children: [span("Title")] }, paragraph(span("Hello ", []), span("world", ["strong"])), paragraph(span("  "))),
    );
    expect(blocks).toEqual([{ type: "h2", text: "Title" }, { type: "p", html: "Hello <strong>world</strong>" }]);
  });

  it("turns lists and block quotes", () => {
    const blocks = structuredTextToBlocks(
      doc(
        { type: "list", style: "numbered", children: [{ type: "listItem", children: [paragraph(span("one"))] }, { type: "listItem", children: [paragraph(span("two", ["emphasis"]))] }] },
        { type: "list", style: "bulleted", children: [{ type: "listItem", children: [paragraph(span("dot"))] }] },
        { type: "blockquote", children: [paragraph(span("Quoted"))] },
      ),
    );
    expect(blocks).toEqual([
      { type: "list", ordered: true, items: ["one", "<em>two</em>"] },
      { type: "list", ordered: false, items: ["dot"] },
      { type: "quote", text: "Quoted", cite: "" },
    ]);
  });

  it("turns custom blocks, merging neighbours into one figure, table or list of steps", () => {
    const blocks = structuredTextToBlocks(
      doc(
        { type: "block", item: "f1" },
        { type: "block", item: "f2" },
        { type: "block", item: "q" },
        { type: "block", item: "r1" },
        { type: "block", item: "r2" },
        { type: "block", item: "s1" },
        { type: "block", item: "s2" },
        { type: "block", item: "missing" },
      ),
      [
        { __typename: "FigureRecord", id: "f1", image: { url: "https://www.datocms-assets.com/1.png", alt: "One" }, caption: "First" },
        { __typename: "FigureRecord", id: "f2", image: { url: "https://www.datocms-assets.com/2.png", alt: null }, caption: "" },
        { __typename: "PullQuoteRecord", id: "q", text: "Steady wins", cite: "Someone" },
        { __typename: "DetailRowRecord", id: "r1", label: "Location", value: "Use your phone's" },
        { __typename: "DetailRowRecord", id: "r2", label: "Method", value: "Suggested" },
        { __typename: "StepRecord", id: "s1", title: "Review", body: "Look back", image: { url: "https://www.datocms-assets.com/s1.png", alt: "Review screen" } },
        { __typename: "StepRecord", id: "s2", title: "Close", body: "Good night", image: null },
      ],
    );
    expect(blocks).toEqual([
      { type: "figure", items: [{ src: "https://www.datocms-assets.com/1.png", alt: "One", caption: "First" }, { src: "https://www.datocms-assets.com/2.png", alt: "", caption: "" }] },
      { type: "quote", text: "Steady wins", cite: "Someone" },
      { type: "kv", rows: [{ k: "Location", v: "Use your phone's" }, { k: "Method", v: "Suggested" }] },
      { type: "steps", items: [{ title: "Review", body: "Look back", src: "https://www.datocms-assets.com/s1.png", alt: "Review screen" }, { title: "Close", body: "Good night", src: "", alt: undefined }] },
    ]);
  });

  it("copes with an empty or missing body", () => {
    expect(structuredTextToBlocks(null)).toEqual([]);
    expect(structuredTextToBlocks({})).toEqual([]);
  });
});

describe("toPost", () => {
  const record = {
    slug: "hello",
    title: "Hello",
    accent: "world.",
    category: "Guides",
    date: "2026-10-09",
    readMinutes: 3,
    excerpt: "Short",
    lede: "Lede",
    featured: true,
    next: { slug: "other" },
    cover: { url: "https://www.datocms-assets.com/c.png", alt: null },
    body: { value: { document: { type: "root", children: [paragraph(span("Body"))] } as never } },
  };

  it("maps a record to a post", () => {
    expect(toPost(record as never)).toMatchObject({
      slug: "hello",
      accent: "world.",
      category: "Guides",
      featured: true,
      next: "other",
      cover: { src: "https://www.datocms-assets.com/c.png", alt: "" },
      body: [{ type: "p", html: "Body" }],
    });
  });

  it("falls back for an unknown category and empty optional fields", () => {
    const post = toPost({ ...record, category: "Poetry", accent: null, featured: null, next: null, cover: null, body: null } as never);
    expect(post.category).toBe("Story");
    expect(post).toMatchObject({ accent: undefined, featured: undefined, next: undefined, cover: undefined, body: [] });
  });
});

describe("fetchPosts", () => {
  const ok = (data: unknown) => vi.fn().mockResolvedValue(new Response(JSON.stringify(data), { status: 200 }));

  it("asks the Content Delivery API with the token and returns posts", async () => {
    const fetchFn = ok({ data: { allPosts: [{ slug: "a", title: "A", category: "Story", date: "2026-01-01", readMinutes: 1, excerpt: "e", lede: "l", body: null }] } });
    const posts = await fetchPosts("tok", "sandbox", fetchFn);
    expect(posts.map((p) => p.slug)).toEqual(["a"]);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://graphql.datocms.com/");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.headers["X-Environment"]).toBe("sandbox");
    expect(JSON.parse(init.body).query).toContain("allPosts");
  });

  it("does not send an environment header when there is none", async () => {
    const fetchFn = ok({ data: { allPosts: [] } });
    await fetchPosts("tok", undefined, fetchFn);
    expect(fetchFn.mock.calls[0][1].headers["X-Environment"]).toBeUndefined();
  });

  it("returns an empty list when there are no posts", async () => {
    expect(await fetchPosts("tok", undefined, ok({ data: {} }))).toEqual([]);
  });

  it("throws on an HTTP error or a GraphQL error, so a build never ships an empty Journal", async () => {
    await expect(fetchPosts("tok", undefined, vi.fn().mockResolvedValue(new Response("no", { status: 401 })))).rejects.toThrow("failed: 401");
    await expect(fetchPosts("tok", undefined, ok({ errors: [{ message: "bad" }] }))).rejects.toThrow("returned errors");
  });
});
