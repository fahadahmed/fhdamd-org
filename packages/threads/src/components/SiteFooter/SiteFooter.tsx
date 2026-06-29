import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "../Container/Container";
import type { SiteVariant } from "../SiteNav/SiteNav";
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
  site?: SiteVariant;
  /** Simple flat list of links (fhdamd style) */
  links?: FooterLink[];
  /** Grouped column links (Riqa style) */
  columns?: FooterColumn[];
  tagline?: string;
  copyright?: string;
  /** Extra content in the bottom bar (right side) */
  bottomRight?: ReactNode;
}

/* ── Brand marks ─────────────────────────────────────────────────────────── */

function RiqaWordmark() {
  return (
    <span className={styles.wordmark}>
      Ri<em className={styles.wordmarkAccent}>qa</em>
    </span>
  );
}

function FhdamdMarkFaint() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="8 14 58 66"
      fill="none"
      className={styles.logoMark}
      aria-hidden="true"
      focusable="false"
    >
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M46.3313 30.3054L63.4604 46.0093C64.4102 46.88 64.477 48.3588 63.6097 49.3123C63.5858 49.3385 63.5613 49.3642 63.5362 49.3894C62.6409 50.2876 61.1898 50.2872 60.2951 49.3884C60.2618 49.355 60.2295 49.3205 60.1984 49.2851L44.7249 31.6973C44.3622 31.2849 44.4011 30.6555 44.8118 30.2913C44.8155 30.288 44.8192 30.2848 44.8229 30.2816C45.2596 29.9059 45.9067 29.9162 46.3313 30.3054Z"/>
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M39.5252 70.6664L60.2944 46.6909C61.1187 45.7395 62.5552 45.6389 63.503 46.4664C63.5426 46.501 63.5811 46.537 63.6182 46.5743C64.5449 47.504 64.5453 49.0118 63.6192 49.942C63.604 49.9573 63.5886 49.9724 63.5729 49.9873L40.4438 71.9878C40.1818 72.237 39.7682 72.2258 39.5199 71.9628C39.4962 71.9376 39.4744 71.9106 39.4549 71.8819C39.2001 71.5079 39.229 71.0083 39.5252 70.6664Z"/>
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M22.1867 70.6282L37.1168 20.0583C37.4769 18.8387 38.7538 18.143 39.9687 18.5045C40.0132 18.5177 40.0574 18.5323 40.101 18.5483C41.366 19.0102 42.0184 20.4141 41.5583 21.6841C41.5582 21.6844 41.5581 21.6846 41.558 21.6849L23.5829 71.2347C23.4517 71.5962 23.0535 71.7825 22.6934 71.6509C22.68 71.646 22.6667 71.6406 22.6536 71.6349C22.2671 71.4657 22.0669 71.034 22.1867 70.6282Z"/>
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M37.9893 47.4011L62.194 45.8858C63.4244 45.8087 64.4841 46.7477 64.5608 47.9829C64.5637 48.0294 64.5651 48.0759 64.5651 48.1224C64.5651 49.3735 63.5549 50.3877 62.3087 50.3877C62.2699 50.3877 62.2312 50.3867 62.1925 50.3847L38.0304 49.1344C37.57 49.1106 37.2056 48.7348 37.1941 48.2722C37.1828 47.8144 37.5341 47.4296 37.9893 47.4011Z"/>
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M39.5496 18.2388H64.2225C64.5928 18.2388 64.8931 18.5402 64.8931 18.912C64.8931 18.9776 64.8835 19.0429 64.8647 19.1057C64.7075 19.6313 64.2525 20.0117 63.7091 20.0718L39.5353 22.7475C38.367 22.8769 37.3155 22.0309 37.1866 20.858C37.1781 20.7802 37.1738 20.7021 37.1738 20.6238C37.1738 19.3066 38.2375 18.2388 39.5496 18.2388Z"/>
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function SiteFooter({
  site = "riqa",
  links = [],
  columns = [],
  tagline,
  copyright,
  bottomRight,
  className,
  ...rest
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const isDark = true; // both sites use dark footer per reference HTML
  const hasColumns = columns.length > 0;

  const defaultCopyright = site === "fhdamd"
    ? `fhdamd.dev · Melbourne, VIC · ${year}`
    : `© ${year} Riqa. All rights reserved.`;
  const copy = copyright ?? defaultCopyright;

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
            /* ── Column layout (Riqa) ────────────────────────────── */
            <>
              <div className={styles.top}>
                <div className={styles.brand}>
                  <RiqaWordmark />
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
                <p className={styles.copy}>{copy}</p>
                {bottomRight && <p className={styles.copy}>{bottomRight}</p>}
              </div>
            </>
          ) : (
            /* ── Simple layout (fhdamd) ────────────────────────────────── */
            <div className={styles.simple}>
              <div className={styles.brand}>
                {site === "fhdamd" ? (
                  <>
                    <FhdamdMarkFaint />
                    <span className={styles.brandName}>Fahad Ahmed</span>
                  </>
                ) : (
                  <RiqaWordmark />
                )}
              </div>
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
              <p className={styles.copy}>{copy}</p>
            </div>
          )}

        </div>
      </Container>
    </footer>
  );
}
