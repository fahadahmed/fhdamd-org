import type { HTMLAttributes } from "react";
import styles from "./EssayRow.module.css";

export type EssayCategory = "design" | "product" | "dev";

export interface EssayRowProps extends HTMLAttributes<HTMLAnchorElement> {
  date: string;
  title: string;
  subtitle?: string;
  category?: EssayCategory;
  href?: string;
  first?: boolean;
}

const categoryLabel: Record<EssayCategory, string> = {
  design:  "Design",
  product: "Product",
  dev:     "Dev",
};

export function EssayRow({
  date,
  title,
  subtitle,
  category,
  href = "#",
  first,
  className,
  ...rest
}: EssayRowProps) {
  return (
    <a
      href={href}
      className={[styles.row, first ? styles.first : "", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span className={styles.date}>{date}</span>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
      {category && (
        <span className={[styles.chip, styles[category]].join(" ")}>
          {categoryLabel[category]}
        </span>
      )}
      <span className={styles.arrow} aria-hidden="true">→</span>
    </a>
  );
}
