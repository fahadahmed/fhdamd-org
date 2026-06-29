import { useState, useEffect, useRef } from "react";
import { Container } from "../Container/Container";
import { Button } from "../Button/Button";
import styles from "./SiteNav.module.css";

export type SiteVariant = "riqa" | "fhdamd";

export interface NavLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface NavCta {
  href?: string;
  label: string;
  variant?: "ghost" | "solid-terra" | "solid-ink" | "outline";
  onClick?: () => void;
}

export interface SiteNavProps {
  site?: SiteVariant;
  links?: NavLink[];
  ctas?: NavCta[];
  homeHref?: string;
  className?: string;
}

/* ── Brand marks ─────────────────────────────────────────────────────────── */

function RiqaWordmark() {
  return (
    <span className={styles.wordmark}>
      Riqa<em className={styles.wordmarkDot}>.</em>
    </span>
  );
}

function FhdamdMark() {
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

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function SiteNav({
  site = "riqa",
  links = [],
  ctas = [],
  homeHref = "/",
  className,
}: SiteNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const close = () => setMobileOpen(false);

  const isPrimary = (v?: string) =>
    v === "solid-ink" || v === "solid-terra";

  return (
    <header
      className={[styles.nav, className].filter(Boolean).join(" ")}
      data-mobile-open={mobileOpen || undefined}
    >
      <Container as="div">
        <div className={styles.inner}>

          {/* Brand */}
          <a
            href={homeHref}
            className={styles.brand}
            aria-label={site === "riqa" ? "Riqa home" : "fhdamd home"}
          >
            {site === "riqa" ? (
              <RiqaWordmark />
            ) : (
              <>
                <FhdamdMark />
                <span className={styles.brandName}>fhdamd</span>
              </>
            )}
          </a>

          {/* Desktop nav links */}
          {links.length > 0 && (
            <nav aria-label="Main navigation" className={styles.desktopNav}>
              <ul className={styles.linkList}>
                {links.map(({ href, label, active }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className={[styles.link, active ? styles.linkActive : ""]
                        .filter(Boolean)
                        .join(" ")}
                      aria-current={active ? "page" : undefined}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Desktop CTAs + burger */}
          <div className={styles.actions}>
            {ctas.length > 0 && (
              <div className={styles.ctaGroup}>
                {ctas.map((c) => (
                  <Button
                    key={c.label}
                    href={c.href}
                    variant={c.variant ?? "ghost"}
                    size="sm"
                    onClick={c.onClick}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            )}

            <button
              ref={burgerRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
              className={styles.burger}
              data-testid="burger"
            >
              <BurgerIcon open={mobileOpen} />
            </button>
          </div>

        </div>
      </Container>

      {/* Mobile nav drawer */}
      <nav
        id="site-mobile-nav"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={[styles.mobileNav, mobileOpen ? styles.mobileNavOpen : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <Container as="div">
          <ul className={styles.mobileLinkList}>
            {/* Nav links */}
            {links.map(({ href, label, active }) => (
              <li key={href}>
                <a
                  href={href}
                  className={[
                    styles.mobileLink,
                    active ? styles.mobileLinkActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={active ? "page" : undefined}
                  onClick={close}
                >
                  {label}
                </a>
              </li>
            ))}

            {/* CTAs — rendered as styled list items, not Button components */}
            {ctas.length > 0 && (
              <>
                <li className={styles.mobileDivider} aria-hidden="true" />
                {ctas.map((c) => {
                  const cls = [
                    styles.mobileLink,
                    isPrimary(c.variant) ? styles.mobilePrimary : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  if (c.onClick) {
                    return (
                      <li key={c.label}>
                        <button
                          type="button"
                          className={cls}
                          onClick={() => { c.onClick!(); close(); }}
                        >
                          {c.label}
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={c.label}>
                      <a href={c.href} className={cls} onClick={close}>
                        {c.label}
                      </a>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        </Container>
      </nav>
    </header>
  );
}
