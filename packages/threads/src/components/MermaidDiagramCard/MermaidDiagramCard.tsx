import type { HTMLAttributes, ReactNode } from "react";
import styles from "./MermaidDiagramCard.module.css";

export interface MermaidDiagramCardProps extends HTMLAttributes<HTMLDivElement> {
  /** e.g. "Sequence diagram · Mermaid" */
  label: string;
  icon?: ReactNode;
  caption?: string;
  /**
   * The rendered diagram. MermaidDiagramCard does not bundle or invoke the
   * `mermaid` package itself — the consuming app owns loading it, rendering
   * from source, and re-rendering on theme change, then passes the result
   * here. Keeps this package decoupled from a specific diagramming runtime.
   */
  children: ReactNode;
}

const DefaultIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

export function MermaidDiagramCard({
  label,
  icon,
  caption,
  children,
  className,
  ...rest
}: MermaidDiagramCardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.label}>
        {icon ?? <DefaultIcon />}
        {label}
      </div>
      <div className={styles.diagram}>{children}</div>
      {caption && <div className={styles.caption}>{caption}</div>}
    </div>
  );
}
