import type { HTMLAttributes } from "react";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={[styles.nav, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <li key={i} className={styles.item}>
              {isCurrent ? (
                <span
                  className={styles.current}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <a href={item.href ?? "#"} className={styles.link}>
                    {item.label}
                  </a>
                  <span className={styles.sep} aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
