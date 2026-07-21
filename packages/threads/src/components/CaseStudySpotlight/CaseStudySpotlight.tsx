import type { HTMLAttributes, ReactNode } from "react";
import { Tag } from "../Badge/Tag";
import styles from "./CaseStudySpotlight.module.css";

export interface CaseStudyStat {
  /** The number/value, e.g. "<3", "0", "100" — supports ReactNode for a trailing <em> unit */
  value: ReactNode;
  label: string;
}

export interface CaseStudySpotlightProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow: string;
  title: ReactNode;
  description: string;
  tags?: string[];
  stats: CaseStudyStat[];
  /** CTA buttons — consumer composes with the existing Button component */
  actions?: ReactNode;
}

export function CaseStudySpotlight({
  eyebrow,
  title,
  description,
  tags = [],
  stats,
  actions,
  className,
  ...rest
}: CaseStudySpotlightProps) {
  return (
    <div className={[styles.spotlight, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.body}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <div className={styles.title}>{title}</div>
        <p className={styles.desc}>{description}</p>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        )}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.stats}>
        {stats.map((stat, i) => (
          <div className={styles.stat} key={i}>
            <span className={styles.num}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
