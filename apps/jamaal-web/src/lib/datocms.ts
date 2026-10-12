import type { Block, Category, Post } from "./journal";
import { CATEGORIES } from "./journal";
import type { RawPost } from "./cms/types";

/**
 * Turns what DatoCMS returns for the Journal, and Structured Text in general,
 * into the site's own blocks. The requests live in cms/queries.ts and
 * cms/client.ts. See the README for the models to create in DatoCMS.
 */

export interface Dast {
  type: string;
  children?: Dast[];
  value?: string;
  marks?: string[];
  url?: string;
  level?: number;
  style?: string;
  item?: string;
}

interface DatoImage {
  url: string;
  alt?: string | null;
}

type DatoBlock = { __typename: string; id: string } & Record<string, unknown>;

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Only web, mail and site-relative links survive; anything else (javascript:, data:, protocol-relative //host) is dropped. */
export function safeHref(url: string | undefined): string | undefined {
  return url && /^(https?:\/\/|mailto:|\/(?!\/))/i.test(url) ? url : undefined;
}

/** Spans and links inside a paragraph become the small HTML subset the site renders: strong, em and links. */
export function inlineHtml(nodes: Dast[] = []): string {
  return nodes
    .map((node) => {
      if (node.type === "span") {
        let out = escapeHtml(node.value ?? "");
        if (node.marks?.includes("strong")) out = `<strong>${out}</strong>`;
        if (node.marks?.includes("emphasis")) out = `<em>${out}</em>`;
        return out;
      }
      if (node.type === "link") {
        const href = safeHref(node.url);
        const inner = inlineHtml(node.children);
        return href ? `<a href="${escapeHtml(href)}">${inner}</a>` : inner;
      }
      return inlineHtml(node.children);
    })
    .join("");
}

export const plainText = (nodes: Dast[] = []): string =>
  nodes.map((n) => (n.type === "span" ? (n.value ?? "") : plainText(n.children))).join("");

/** Turns a DatoCMS Structured Text document and its blocks into the site's blocks. */
export function structuredTextToBlocks(value: { document?: Dast } | null | undefined, blocks: DatoBlock[] = []): Block[] {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const out: Block[] = [];
  const pushRow = (k: string, v: string) => {
    const last = out.at(-1);
    if (last?.type === "kv") last.rows.push({ k, v });
    else out.push({ type: "kv", rows: [{ k, v }] });
  };
  const pushFigure = (item: { src: string; alt: string; caption: string }) => {
    const last = out.at(-1);
    if (last?.type === "figure") last.items.push(item);
    else out.push({ type: "figure", items: [item] });
  };
  const pushStep = (item: { title: string; body: string; src: string; alt?: string }) => {
    const last = out.at(-1);
    if (last?.type === "steps") last.items.push(item);
    else out.push({ type: "steps", items: [item] });
  };

  for (const node of value?.document?.children ?? []) {
    if (node.type === "paragraph") {
      const html = inlineHtml(node.children);
      if (html.trim()) out.push({ type: "p", html });
    } else if (node.type === "heading") {
      out.push({ type: "h2", text: plainText(node.children) });
    } else if (node.type === "list") {
      const items = (node.children ?? []).map((li) => inlineHtml(li.children?.flatMap((p) => p.children ?? [])));
      out.push({ type: "list", ordered: node.style === "numbered", items });
    } else if (node.type === "blockquote") {
      out.push({ type: "quote", text: plainText(node.children), cite: "" });
    } else if (node.type === "block") {
      const block = node.item ? byId.get(node.item) : undefined;
      if (!block) continue;
      if (block.__typename === "FigureRecord") {
        const image = block.image as DatoImage | null;
        if (image) pushFigure({ src: image.url, alt: image.alt ?? "", caption: String(block.caption ?? "") });
      } else if (block.__typename === "PullQuoteRecord") {
        out.push({ type: "quote", text: String(block.text ?? ""), cite: String(block.cite ?? "") });
      } else if (block.__typename === "DetailRowRecord") {
        pushRow(String(block.label ?? ""), String(block.value ?? ""));
      } else if (block.__typename === "StepRecord") {
        const image = block.image as DatoImage | null;
        pushStep({ title: String(block.title ?? ""), body: String(block.body ?? ""), src: image?.url ?? "", alt: image?.alt ?? undefined });
      }
    }
  }
  return out;
}

export function toPost(record: RawPost): Post {
  const category = (CATEGORIES as readonly string[]).includes(record.category) ? (record.category as Category) : "Story";
  return {
    slug: record.slug,
    title: record.title,
    accent: record.accent || undefined,
    category,
    date: record.date,
    readMinutes: record.readMinutes,
    excerpt: record.excerpt,
    featuredExcerpt: record.featuredExcerpt || undefined,
    lede: record.lede,
    featured: record.featured || undefined,
    ctaNote: record.ctaNote || undefined,
    next: record.next?.slug,
    seo: record.seo ?? undefined,
    cover: record.cover ? { src: record.cover.url, alt: record.cover.alt ?? "" } : undefined,
    body: structuredTextToBlocks(record.body?.value as { document?: Dast } | undefined, record.body?.blocks),
  };
}
