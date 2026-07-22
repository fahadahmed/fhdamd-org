import type { HTMLAttributes, ReactNode } from "react";
import { Badge, type BadgeVariant } from "../Badge/Badge";
import styles from "./ContentCard.module.css";

export interface ContentCardBadge {
  label: string;
  variant?: BadgeVariant;
}

export interface ContentCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  badges?: ContentCardBadge[];
  title: ReactNode;
  description?: string;
  /** e.g. "May 2026" — or "Coming soon" when comingSoon is true */
  date: string;
  href?: string;
  /** Dashed, non-interactive placeholder state — no href, no hover lift, no arrow */
  comingSoon?: boolean;
}

const ArrowIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export function ContentCard({
  badges = [],
  title,
  description,
  date,
  href,
  comingSoon = false,
  className,
  ...rest
}: ContentCardProps) {
  const Tag = comingSoon || !href ? "div" : "a";
  const cls = [styles.card, comingSoon ? styles.comingSoon : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={cls} href={comingSoon ? undefined : href} {...rest}>
      {badges.length > 0 && (
        <div className={styles.badges}>
          {badges.map((b) => <Badge key={b.label} variant={b.variant}>{b.label}</Badge>)}
        </div>
      )}
      <div className={styles.title}>{title}</div>
      {description && <p className={styles.desc}>{description}</p>}
      <div className={styles.foot}>
        <span className={styles.date}>{date}</span>
        {!comingSoon && (
          <div className={styles.arr}>
            <ArrowIcon />
          </div>
        )}
      </div>
    </Tag>
  );
}
