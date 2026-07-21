import type { HTMLAttributes, ReactNode } from "react";
import { Badge, type BadgeVariant } from "../Badge/Badge";
import styles from "./FeaturedCard.module.css";

export interface FeaturedCardBadge {
  label: string;
  variant?: BadgeVariant;
}

export interface FeaturedCardProps extends Omit<HTMLAttributes<HTMLAnchorElement>, "title"> {
  /** Text after the fixed "Featured" badge, e.g. "July 2026 · 9 min read" */
  eyebrowMeta: string;
  title: ReactNode;
  description: string;
  metaBadges?: FeaturedCardBadge[];
  href: string;
}

export function FeaturedCard({
  eyebrowMeta,
  title,
  description,
  metaBadges = [],
  href,
  className,
  ...rest
}: FeaturedCardProps) {
  return (
    <a className={[styles.card, className].filter(Boolean).join(" ")} href={href} {...rest}>
      <div className={styles.eyebrow}>
        <Badge variant="neutral">Featured</Badge> {eyebrowMeta}
      </div>
      <div className={styles.title}>{title}</div>
      <p className={styles.desc}>{description}</p>
      {metaBadges.length > 0 && (
        <div className={styles.meta}>
          {metaBadges.map((b) => <Badge key={b.label} variant={b.variant}>{b.label}</Badge>)}
        </div>
      )}
    </a>
  );
}
