import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Prose.module.css";

export interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Typography scope for rendered article body content (e.g. a Structured Text field) — h2/h3, blockquote, lists, inline code, and link underline-draw all styled via descendant selectors. */
export function Prose({ children, className, ...rest }: ProseProps) {
  return (
    <div className={[styles.prose, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
