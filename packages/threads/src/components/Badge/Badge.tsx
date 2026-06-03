import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant =
  | "terra"
  | "sage"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "inverse";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  terra:   styles.terra,
  sage:    styles.sage,
  warning: styles.warning,
  error:   styles.error,
  info:    styles.info,
  neutral: styles.neutral,
  inverse: styles.inverse,
};

export function Badge({
  variant = "neutral",
  dot,
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, variantStyles[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
