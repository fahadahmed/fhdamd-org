/**
 * Minimal reader for DatoCMS's Structured Text ("dast") JSON format —
 * extracts paragraphs with inline marks, which is all fields like
 * AboutPage.bio use. Not a general-purpose renderer (no headings or
 * embedded blocks) — but does walk into lists, since the DatoCMS editor
 * will auto-convert a paragraph into a list item if it looks numbered
 * (e.g. starts with "1. "), and that shouldn't make the content vanish.
 */

interface DastSpan {
  type: "span";
  value: string;
  marks?: string[];
}

interface DastParagraph {
  type: "paragraph";
  children: DastSpan[];
}

export interface DastValue {
  schema: "dast";
  document: {
    type: "root";
    children: unknown[];
  };
}

const MARK_TAGS: Record<string, string> = {
  strong: "strong",
  emphasis: "em",
  code: "code",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function spanToHtml(span: DastSpan): string {
  const escaped = escapeHtml(span.value);
  return (span.marks ?? []).reduce((html, mark) => {
    const tag = MARK_TAGS[mark];
    return tag ? `<${tag}>${html}</${tag}>` : html;
  }, escaped);
}

function isParagraph(node: unknown): node is DastParagraph {
  return typeof node === "object" && node !== null && (node as { type?: string }).type === "paragraph";
}

function hasChildren(node: unknown): node is { children: unknown[] } {
  return typeof node === "object" && node !== null && Array.isArray((node as { children?: unknown }).children);
}

/** Depth-first paragraph search — finds paragraphs at the root or nested inside lists/list items. */
function collectParagraphs(nodes: unknown[]): DastParagraph[] {
  return nodes.flatMap((node) => (isParagraph(node) ? [node] : hasChildren(node) ? collectParagraphs(node.children) : []));
}

/** Extracts every paragraph as an HTML string, in document order, dropping any other formatting (list numbering, headings). */
export function dastToParagraphHtml(value: DastValue): string[] {
  return collectParagraphs(value.document.children).map((paragraph) => paragraph.children.map(spanToHtml).join(""));
}
