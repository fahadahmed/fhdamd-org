import type { ReactNode } from "react";
import { Tag } from "../Badge/Tag";
import type { BadgeVariant } from "../Badge/Badge";
import { Badge } from "../Badge/Badge";
import styles from "./ProjectCard.module.css";

export type ProjectCardAccent = "terra" | "sage" | "ink";

export interface PricingPill {
  price: string;
  label: string;
}

export interface ProjectCardProps {
  eyebrow?: string;
  name: ReactNode;
  description: string;
  tags?: string[];
  badge?: { label: string; variant: BadgeVariant };
  accentColor?: ProjectCardAccent;
  /** Icon area: pass a ReactNode for a custom icon tile */
  icon?: ReactNode;
  /** Use the Jamaal "J" avatar instead of a regular icon */
  jamaalIcon?: boolean;
  pricingPills?: PricingPill[];
  href?: string;
  className?: string;
}

function ArrowIcon() {
  return (
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
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function ProjectCard({
  eyebrow,
  name,
  description,
  tags = [],
  badge,
  accentColor = "terra",
  icon,
  jamaalIcon,
  pricingPills = [],
  href,
  className,
}: ProjectCardProps) {
  const accentClass =
    accentColor === "terra"
      ? styles.accentTerra
      : accentColor === "sage"
      ? styles.accentSage
      : styles.accentInk;

  const Tag_ = href ? "a" : "div";
  const linkProps = href ? { href, "aria-label": undefined } : {};

  return (
    <Tag_
      className={[styles.card, accentClass, href ? styles.interactive : "", className]
        .filter(Boolean)
        .join(" ")}
      {...linkProps}
    >
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}

      {/* Icon area */}
      {jamaalIcon ? (
        <div className={styles.jamaalIcon}>
          <span className={styles.jLetter}>J</span>
        </div>
      ) : icon ? (
        <div className={[styles.icon, accentColor === "sage" ? styles.iconSage : styles.iconInk].join(" ")}>
          {icon}
        </div>
      ) : null}

      <div className={styles.name}>{name}</div>
      <p className={styles.desc}>{description}</p>

      {pricingPills.length > 0 && (
        <div className={styles.pricingPills}>
          {pricingPills.map(({ price, label }) => (
            <div key={label} className={styles.pill}>
              <div className={styles.pillPrice}>{price}</div>
              <div className={styles.pillLabel}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        <div className={styles.footerRight}>
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          {href && (
            <span className={styles.arrow}>
              <ArrowIcon />
            </span>
          )}
        </div>
      </div>
    </Tag_>
  );
}
