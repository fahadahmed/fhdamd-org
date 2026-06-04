import type { MouseEvent } from "react";
import { Button } from "../Button/Button";
import type { ButtonVariant } from "../Button/Button";
import styles from "./PriceCard.module.css";

export interface PriceCardOperation {
  label: string;
  tag: string;
}

export interface PriceCardProps {
  credits: number;
  price: string;
  priceNote?: string;
  featured?: boolean;
  featuredLabel?: string;
  operations?: PriceCardOperation[];
  cta: { href?: string; label: string };
  /** Optional click handler on the CTA button (e.g. for Stripe checkout) */
  onCtaClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  ctaVariant?: ButtonVariant;
  className?: string;
}

export function PriceCard({
  credits,
  price,
  priceNote,
  featured,
  featuredLabel = "Most popular",
  operations = [],
  cta,
  onCtaClick,
  ctaVariant,
  className,
}: PriceCardProps) {
  const defaultCtaVariant: ButtonVariant = featured ? "solid-terra" : "ghost";

  return (
    <div
      className={[styles.card, featured ? styles.featured : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {featured && (
        <span className={styles.featuredBadge}>{featuredLabel}</span>
      )}

      {/* Top content — flex: 1 so it fills available space and pins CTA to bottom */}
      <div className={styles.content}>
        <div className={styles.credits}>
          {credits}<span className={styles.creditsUnit}>cr</span>
        </div>

        <div className={styles.price}>{price}</div>

        {priceNote && <div className={styles.priceNote}>{priceNote}</div>}

        {operations.length > 0 && (
          <>
            <hr className={styles.divider} />
            <ul className={styles.operations}>
              {operations.map(({ label, tag }) => (
                <li key={label} className={styles.operation}>
                  <span className={styles.opLabel}>{label}</span>
                  <span className={styles.opTag}>{tag}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Button
        href={cta.href}
        variant={ctaVariant ?? defaultCtaVariant}
        className={styles.cta}
        onClick={onCtaClick}
      >
        {cta.label}
      </Button>
    </div>
  );
}
