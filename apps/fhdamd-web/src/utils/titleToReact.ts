import { createElement, type ReactNode } from "react";

export function titleToReact(text: string): ReactNode {
  const parts = text
    .split(/(\*[^*]+\*)/g)
    .map((part, i) => (part.startsWith("*") ? createElement("em", { key: i }, part.slice(1, -1)) : part));
  return parts.length === 1 ? parts[0] : parts;
}
