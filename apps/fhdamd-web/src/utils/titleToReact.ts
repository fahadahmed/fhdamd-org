import { createElement, type CSSProperties, type ReactNode } from "react";

/**
 * Most Threads components (SectionHeader, ClientWorkRow) already colour
 * their own `em` accents via CSS. Hero's heading doesn't, so callers can
 * pass emStyle to colour it inline instead of waiting on a package fix.
 */
export function titleToReact(text: string, emStyle?: CSSProperties): ReactNode {
  const parts = text
    .split(/(\*[^*]+\*)/g)
    .map((part, i) =>
      part.startsWith("*") ? createElement("em", { key: i, style: emStyle }, part.slice(1, -1)) : part,
    );
  return parts.length === 1 ? parts[0] : parts;
}
