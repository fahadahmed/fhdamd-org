import type { HTMLAttributes } from "react";
import styles from "./AvailabilityPill.module.css";

export interface AvailabilityPillProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  available?: boolean;
}

export function AvailabilityPill({
  label = "Open to select projects",
  available = true,
  className,
  ...rest
}: AvailabilityPillProps) {
  return (
    <div className={[styles.pill, className].filter(Boolean).join(" ")} {...rest}>
      <span className={styles.pip} aria-hidden="true">
        <span className={[styles.dot, available ? styles.dotAvailable : styles.dotBusy].join(" ")} />
      </span>
      <span>{label}</span>
    </div>
  );
}
