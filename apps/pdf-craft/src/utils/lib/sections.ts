import { createElement } from "react";
import type { SectionHeader } from "../types";

export function titleToReact(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") ? createElement("em", { key: i }, part.slice(1, -1)) : part,
  );
}

export function indexSectionHeaders(
  headers: SectionHeader[],
): Record<string, SectionHeader> {
  return Object.fromEntries(headers.map((s) => [s.key, s]));
}
