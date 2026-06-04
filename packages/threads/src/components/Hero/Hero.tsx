import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Hero.module.css";

export interface HeroProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  /** Main heading — h1, supports ReactNode for <em> accents */
  heading: ReactNode;
  /** Second line shown in muted text — supports ReactNode for <em> italic */
  subheading?: ReactNode;
  body?: string;
  /** Short chip/badge labels below the body (e.g. "No subscription") */
  chips?: string[];
  /** CTA buttons or any action content */
  actions?: ReactNode;
}

export function Hero({
  eyebrow,
  heading,
  subheading,
  body,
  chips,
  actions,
  className,
  ...rest
}: HeroProps) {
  return (
    <section
      className={[styles.hero, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {eyebrow && (
        <div className={styles.eyebrow} aria-hidden="true">{eyebrow}</div>
      )}

      <h1 className={styles.heading}>{heading}</h1>

      {subheading && (
        <h2 className={styles.subheading}>{subheading}</h2>
      )}

      {body && <p className={styles.body}>{body}</p>}

      {chips && chips.length > 0 && (
        <ul className={styles.chips} aria-label="Key features">
          {chips.map((chip) => (
            <li key={chip} className={styles.chip}>{chip}</li>
          ))}
        </ul>
      )}

      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
}
