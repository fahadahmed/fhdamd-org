import type { HTMLAttributes, ReactNode } from "react";
import styles from "./IconDetailRow.module.css";

export type IconDetailRowVariant = "compact" | "labeled";

export interface IconDetailRowProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  /** Shown above the value in "labeled" variant. Ignored in "compact" variant. */
  label?: string;
  value: string;
  /**
   * "compact" — small icon tile + single mono text line (e.g. About's sidebar card).
   * "labeled" — larger icon tile + label-above-value block (e.g. Contact's aside card).
   */
  variant?: IconDetailRowVariant;
}

const variantStyles: Record<IconDetailRowVariant, string> = {
  compact: styles.compact,
  labeled: styles.labeled,
};

export function IconDetailRow({
  icon,
  label,
  value,
  variant = "labeled",
  className,
  ...rest
}: IconDetailRowProps) {
  return (
    <div
      className={[styles.row, variantStyles[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className={styles.icon} aria-hidden="true">{icon}</div>
      {variant === "labeled" ? (
        <div>
          {label && <span className={styles.label}>{label}</span>}
          <span className={styles.value}>{value}</span>
        </div>
      ) : (
        <span className={styles.compactText}>{value}</span>
      )}
    </div>
  );
}
