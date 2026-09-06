"use client";
import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react";
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
   *
   * Expanding to fullscreen toggles a CSS class on this same container
   * rather than moving it (e.g. via a portal) — the diagram is typically a
   * mermaid.render() instance keyed to a stable id, and unmounting/
   * remounting it into a new DOM position on toggle can misbehave.
   */
  children: ReactNode;
}

const DefaultIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const CollapseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="3" y1="21" x2="10" y2="14" />
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
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...rest}>
      <div className={[styles.label, expanded ? styles.labelExpanded : ""].filter(Boolean).join(" ")}>
        {icon ?? <DefaultIcon />}
        {label}
        {/* Hidden while expanded rather than left showing a redundant
            "collapse" state — the fixed .closeBtn below is the only
            expand/collapse control once expanded, so there's never two
            controls doing the same thing at once. */}
        {!expanded && (
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-label="Expand diagram"
            data-testid="mermaid-expand-toggle"
          >
            <ExpandIcon />
          </button>
        )}
      </div>
      {expanded && (
        <>
          {/* Opaque, not a dim scrim — this is a fullscreen reading surface for
              the diagram, not a photo lightbox, so it needs full contrast
              regardless of what's behind it. */}
          <div
            className={styles.backdrop}
            onClick={() => setExpanded(false)}
            data-testid="mermaid-backdrop"
          />
          {/* Fixed to the viewport corner rather than relying on the label
              row's own toggle button staying visible — that button sits at
              its normal in-flow document position, which can scroll out of
              view (or, pre-fix, render underneath the overlay) independently
              of where the fixed fullscreen surface currently is. */}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setExpanded(false)}
            aria-label="Collapse diagram"
            data-testid="mermaid-close-fixed"
          >
            <CollapseIcon />
          </button>
        </>
      )}
      <div className={[styles.diagram, expanded ? styles.diagramExpanded : ""].filter(Boolean).join(" ")}>
        {children}
      </div>
      {caption && <div className={styles.caption}>{caption}</div>}
    </div>
  );
}
