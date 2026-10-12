import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import seedWhy from "../content/journal/why-i-built-jamaal.json";
import seedSalah from "../content/journal/salah-quran-dhikr.json";
import seedNp from "../content/journal/first-night-planning.json";
import { isPost, listTitle, metaLine, monthYear, postTitle, shortMeta, sortPosts } from "./journal";
import type { Post } from "./journal";
import { screen } from "./screens";

const seeds = [seedWhy, seedSalah, seedNp] as unknown as Post[];

describe("bundled articles", () => {
  it("are all valid posts, one per file", () => {
    const files = readdirSync(resolve(__dirname, "../content/journal")).filter((f) => f.endsWith(".json"));
    expect(files).toHaveLength(seeds.length);
    for (const post of seeds) expect(isPost(post), post.slug).toBe(true);
  });

  it("have unique slugs that match their file names, and a next article that exists", () => {
    const slugs = seeds.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const post of seeds) {
      expect(existsSync(resolve(__dirname, `../content/journal/${post.slug}.json`))).toBe(true);
      if (post.next) expect(slugs).toContain(post.next);
    }
  });

  it("point every figure and step at a screenshot that exists, with alt text", () => {
    for (const post of seeds) {
      if (post.cover) expect(() => screen(post.cover!.src)).not.toThrow();
      for (const block of post.body) {
        if (block.type === "figure") {
          for (const item of block.items) {
            expect(() => screen(item.src), item.src).not.toThrow();
            expect(item.alt.length).toBeGreaterThan(5);
          }
        }
        if (block.type === "steps") for (const step of block.items) expect(() => screen(step.src), step.src).not.toThrow();
      }
    }
  });

  it("keep the Salah guide out of the home page copy: only the journal carries religious content", () => {
    expect(seedSalah.category).toBe("Guides");
    expect(seeds.filter((p) => p.featured)).toHaveLength(1);
  });
});

describe("helpers", () => {
  const post = { ...(seedWhy as unknown as Post) };

  it("builds titles and meta lines", () => {
    expect(postTitle(post)).toBe("Why I built Jamaal.");
    expect(listTitle(post)).toBe("Why I built Jamaal");
    expect(metaLine(post)).toBe("Story · October 2026 · 6 min read");
    expect(shortMeta({ ...post, category: "Guides", readMinutes: 8 })).toBe("Guide · 8 min");
    expect(postTitle({ ...post, accent: undefined })).toBe("Why I built");
  });

  it("formats a month and year from an ISO date", () => {
    expect(monthYear("2026-01-05")).toBe("January 2026");
    expect(monthYear("2026-12-31")).toBe("December 2026");
  });

  it("sorts newest first without changing the original list", () => {
    const list = [{ ...post, date: "2026-01-01" }, { ...post, date: "2026-03-01" }, { ...post, date: "2026-02-01" }];
    expect(sortPosts(list).map((p) => p.date)).toEqual(["2026-03-01", "2026-02-01", "2026-01-01"]);
    expect(list[0].date).toBe("2026-01-01");
  });

  it("rejects things that are not posts", () => {
    expect(isPost(null)).toBe(false);
    expect(isPost({ ...post, category: "Poetry" })).toBe(false);
    expect(isPost({ ...post, date: "October" })).toBe(false);
    expect(isPost({ ...post, body: "text" })).toBe(false);
  });
});
