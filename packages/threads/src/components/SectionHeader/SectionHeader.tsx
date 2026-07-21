import type { HTMLAttributes, ReactNode } from "react";
import styles from "./SectionHeader.module.css";

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  /** Short trailing label on the title's baseline, e.g. "14 years", "See the full list" */
  meta?: ReactNode;
  /** Heading level for the title — defaults to h2 */
  as?: "h1" | "h2" | "h3";
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  meta,
  as: Heading = "h2",
  className,
  ...rest
}: SectionHeaderProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.headerRow}>
        <div className={styles.headingBlock}>
          {eyebrow && (
            <div className={styles.eyebrow} aria-hidden="true">{eyebrow}</div>
          )}
          <Heading className={styles.title}>{title}</Heading>
        </div>
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
      {intro && <p className={styles.intro}>{intro}</p>}
    </div>
  );
}
