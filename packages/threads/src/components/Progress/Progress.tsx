import type { HTMLAttributes } from "react";
import styles from "./Progress.module.css";

export type ProgressVariant = "sage" | "terra" | "warning" | "error" | "ink";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;       /* 0–100 */
  variant?: ProgressVariant;
  label?: string;
  showValue?: boolean;
}

export function Progress({
  value,
  variant = "sage",
  label,
  showValue,
  className,
  ...rest
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")} {...rest}>
      {(label || showValue) && (
        <div className={styles.meta}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && <span className={styles.value}>{clamped}%</span>}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={[styles.fill, styles[variant]].join(" ")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
