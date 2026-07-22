import type { HTMLAttributes } from "react";
import styles from "./StatRow.module.css";

export interface Stat {
  number: string;
  unit?: string;
  label: string;
}

export interface StatRowProps extends HTMLAttributes<HTMLDivElement> {
  stats: Stat[];
}

export function StatRow({ stats, className, ...rest }: StatRowProps) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(" ")} {...rest}>
      {stats.map((stat, i) => (
        <div className={styles.card} key={i}>
          <div className={styles.num}>
            {stat.number}
            {stat.unit && <span className={styles.unit}>{stat.unit}</span>}
          </div>
          <div className={styles.label}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
