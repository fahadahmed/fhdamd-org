import type { HTMLAttributes } from "react";
import styles from "./FactStrip.module.css";

export interface Fact {
  label: string;
  value: string;
}

export interface FactStripProps extends HTMLAttributes<HTMLDivElement> {
  facts: Fact[];
}

export function FactStrip({ facts, className, ...rest }: FactStripProps) {
  return (
    <div className={[styles.strip, className].filter(Boolean).join(" ")} {...rest}>
      {facts.map((fact) => (
        <div className={styles.item} key={fact.label}>
          <span className={styles.label}>{fact.label}</span>
          <span className={styles.value}>{fact.value}</span>
        </div>
      ))}
    </div>
  );
}
