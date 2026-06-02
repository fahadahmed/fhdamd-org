import type { ReactNode } from "react";
import styles from "./OpCard.module.css";

export type OpCardIconVariant = "terra" | "sage" | "muted";
export type OpCardStatus = "live" | "soon";

export interface OpCardProps {
  name: string;
  description: string;
  credits: number;
  href?: string;
  icon: ReactNode;
  iconVariant?: OpCardIconVariant;
  status?: OpCardStatus;
  ctaLabel?: string;
  className?: string;
}

const iconVariantStyles: Record<OpCardIconVariant, string> = {
  terra: styles.iconTerra,
  sage:  styles.iconSage,
  muted: styles.iconMuted,
};

const ArrowRight = () => (
  <svg
    width="14"
    height="14"
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

export function OpCard({
  name,
  description,
  credits,
  href,
  icon,
  iconVariant = "terra",
  status = "live",
  ctaLabel,
  className,
}: OpCardProps) {
  const isLive = status === "live";
  const label = ctaLabel ?? name;

  const cls = [
    styles.card,
    isLive ? styles.live : styles.soon,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconCls = [styles.icon, iconVariantStyles[iconVariant]]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <div className={iconCls} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.name}>{name}</div>
      <p className={styles.desc}>{description}</p>
      <div className={styles.cta}>
        {isLive ? (
          <>
            <span className={styles.ctaBtn} aria-hidden="true">
              {label} <ArrowRight />
            </span>
            <div className={styles.credits} aria-label={`${credits} credit${credits !== 1 ? "s" : ""}`}>
              <span className={styles.creditsNum}>{credits}</span>
              <span className={styles.creditsLabel}>
                {credits === 1 ? "credit" : "credits"}
              </span>
            </div>
          </>
        ) : (
          <span className={styles.soonPill}>Coming soon</span>
        )}
      </div>
    </>
  );

  if (isLive && href) {
    return (
      <a href={href} className={cls} aria-label={`${name} — ${credits} credit${credits !== 1 ? "s" : ""}`}>
        {inner}
      </a>
    );
  }

  return (
    <div className={cls} aria-label={isLive ? name : `${name} — coming soon`}>
      {inner}
    </div>
  );
}
