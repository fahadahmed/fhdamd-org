import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import { Container } from "../Container/Container";
import { Button } from "../Button/Button";
import styles from "./SiteNav.module.css";

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
  /** Wordmark/logo markup — fully owned by the consuming app. */
  brand?: ReactNode;
  /** aria-label for the home link, e.g. "Riqa home". Defaults to "Home". */
  brandLabel?: string;
  links?: NavLink[];
  ctas?: NavCta[];
  homeHref?: string;
  className?: string;
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
  brand,
  brandLabel = "Home",
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
          <a href={homeHref} className={styles.brand} aria-label={brandLabel}>
            {brand}
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
