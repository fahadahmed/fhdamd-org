/**
 * The Journal's data. Posts come from DatoCMS (see lib/cms), so the owner, and
 * later family, can write and publish without a developer. This file holds the
 * shape they are turned into and the helpers the pages use.
 */

export const CATEGORIES = ["Story", "Guides", "How-to"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface FigureItem {
  /** A screenshot name for `screen()`, or the full URL of an image uploaded to DatoCMS. */
  src: string;
  alt: string;
  caption: string;
}

export type Block =
  | { type: "p"; html: string }
  | { type: "h2"; text: string }
  | { type: "figure"; items: FigureItem[] }
  | { type: "kv"; rows: { k: string; v: string }[] }
  | { type: "quote"; text: string; cite: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "steps"; items: { title: string; body: string; src: string; alt?: string }[] };

export interface Post {
  slug: string;
  /** The title up to the part that is set in italics. */
  title: string;
  accent?: string;
  category: Category;
  /** ISO date, for example 2026-10-08. */
  date: string;
  readMinutes: number;
  excerpt: string;
  /** A longer teaser for the featured card. */
  featuredExcerpt?: string;
  lede: string;
  featured?: boolean;
  author?: { name: string; role: string; initial: string };
  cover?: { src: string; alt: string };
  /** A line under the call to action, for example "Prayer times work offline, wherever you are." */
  ctaNote?: string;
  /** The slug of the article to suggest next. */
  next?: string;
  body: Block[];
}

export const postTitle = (post: Post): string => [post.title, post.accent].filter(Boolean).join(" ");

/** The title for lists: no full stop at the end. */
export const listTitle = (post: Post): string => postTitle(post).replace(/\.$/, "");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "October 2026" from an ISO date. */
export function monthYear(iso: string): string {
  const [year, month] = iso.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export const metaLine = (post: Post): string => `${post.category === "Guides" ? "Guide" : post.category} · ${monthYear(post.date)} · ${post.readMinutes} min read`;

export const shortMeta = (post: Post): string => `${post.category === "Guides" ? "Guide" : post.category} · ${post.readMinutes} min`;

/** Newest first, and a post that is `featured` is listed separately by the index. */
export function sortPosts(posts: readonly Post[]): Post[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function isPost(value: unknown): value is Post {
  const p = value as Post;
  return (
    typeof p?.slug === "string" &&
    typeof p.title === "string" &&
    (CATEGORIES as readonly string[]).includes(p.category) &&
    /^\d{4}-\d{2}-\d{2}$/.test(p.date) &&
    typeof p.readMinutes === "number" &&
    typeof p.excerpt === "string" &&
    typeof p.lede === "string" &&
    Array.isArray(p.body)
  );
}
