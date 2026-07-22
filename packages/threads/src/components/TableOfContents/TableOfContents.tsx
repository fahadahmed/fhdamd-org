"use client";
import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import styles from "./TableOfContents.module.css";

export interface TableOfContentsItem {
  /** Must match the id of the corresponding heading rendered elsewhere on the page */
  id: string;
  label: string;
}

export interface TableOfContentsProps extends HTMLAttributes<HTMLElement> {
  items: TableOfContentsItem[];
  label?: string;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.14s" }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export function TableOfContents({ items, label = "On this page", className, ...rest }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [open]);

  const activeLabel = items.find((item) => item.id === activeId)?.label ?? label;

  const links = (onNavigate?: () => void) => (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={[styles.link, item.id === activeId ? styles.active : ""].filter(Boolean).join(" ")}
            onClick={onNavigate}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop — sticky sidebar, hidden below 900px */}
      <aside className={[styles.toc, className].filter(Boolean).join(" ")} data-testid="toc-desktop" {...rest}>
        <div className={styles.label}>{label}</div>
        {links()}
      </aside>

      {/* Mobile — sticky collapsed bar that expands into a dropdown, shown below 900px */}
      <nav className={styles.mobileBar} ref={rootRef} aria-label={label} data-testid="toc-mobile">
        <button
          type="button"
          className={styles.mobileTrigger}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          data-testid="toc-mobile-trigger"
        >
          <span className={styles.mobileLabel}>{label}</span>
          <span className={styles.mobileActive} data-testid="toc-mobile-active-label">{activeLabel}</span>
          <ChevronIcon open={open} />
        </button>
        <div className={[styles.mobileMenu, open ? styles.mobileMenuOpen : ""].filter(Boolean).join(" ")}>
          {links(() => setOpen(false))}
        </div>
      </nav>
    </>
  );
}
