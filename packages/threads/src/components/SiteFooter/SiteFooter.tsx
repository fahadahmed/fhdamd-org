import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "../Container/Container";
import styles from "./SiteFooter.module.css";

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SiteFooterProps extends HTMLAttributes<HTMLElement> {
  /** Wordmark/logo markup — fully owned by the consuming app. */
  brand?: ReactNode;
  /** Simple flat list of links (used when no columns are given) */
  links?: FooterLink[];
  /** Grouped column links — switches to the column layout when present */
  columns?: FooterColumn[];
  tagline?: string;
  copyright?: string;
  /** Extra content in the bottom bar (right side) */
  bottomRight?: ReactNode;
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function SiteFooter({
  brand,
  links = [],
  columns = [],
  tagline,
  copyright,
  bottomRight,
  className,
  ...rest
}: SiteFooterProps) {
  const isDark = true; // both layouts use dark footer per reference HTML
  const hasColumns = columns.length > 0;

  return (
    <footer
      className={[styles.footer, isDark ? styles.dark : styles.light, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Container as="div">
        <div className={styles.inner}>

          {hasColumns ? (
            /* ── Column layout ────────────────────────────────────────── */
            <>
              <div className={styles.top}>
                <div className={styles.brand}>
                  {brand}
                  {tagline && <p className={styles.tagline}>{tagline}</p>}
                </div>
                <div className={styles.columns}>
                  {columns.map((col) => (
                    <div key={col.title} className={styles.column}>
                      <div className={styles.columnTitle}>{col.title}</div>
                      <ul className={styles.columnLinks}>
                        {col.links.map(({ href, label }) => (
                          <li key={href}>
                            <a href={href} className={styles.link}>{label}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.bottom}>
                {copyright && <p className={styles.copy}>{copyright}</p>}
                {bottomRight && <p className={styles.copy}>{bottomRight}</p>}
              </div>
            </>
          ) : (
            /* ── Simple layout ──────────────────────────────────────────── */
            <div className={styles.simple}>
              <div className={styles.brand}>{brand}</div>
              {links.length > 0 && (
                <nav aria-label="Footer navigation" className={styles.nav}>
                  <ul className={styles.linkList}>
                    {links.map(({ href, label }) => (
                      <li key={href}>
                        <a href={href} className={styles.link}>{label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              {copyright && <p className={styles.copy}>{copyright}</p>}
            </div>
          )}

        </div>
      </Container>
    </footer>
  );
}
