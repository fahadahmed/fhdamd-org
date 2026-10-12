import { describe, expect, it } from "vitest";
import { isPost, listTitle, metaLine, monthYear, postTitle, shortMeta, sortPosts } from "./journal";
import type { Post } from "./journal";

const whyPost: Post = {
  slug: "why-i-built-jamaal",
  title: "Why I built",
  accent: "Jamaal.",
  category: "Story",
  date: "2026-10-08",
  readMinutes: 6,
  excerpt: "Four apps, none of which knew how much day I had.",
  lede: "I didn't set out to make a productivity app.",
  featured: true,
  body: [{ type: "p", html: "Hello" }],
};

describe("helpers", () => {
  const post = { ...whyPost };

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
