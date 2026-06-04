import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Banner.module.css";

export type BannerVariant = "success" | "warning" | "error" | "info";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BannerVariant;
  children: ReactNode;
  onDismiss?: () => void;
}

const variantRole: Record<BannerVariant, string> = {
  success: "status",
  warning: "note",
  error:   "alert",
  info:    "note",
};

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function Banner({
  variant = "info",
  children,
  onDismiss,
  className,
  ...rest
}: BannerProps) {
  return (
    <div
      role={variantRole[variant]}
      className={[styles.banner, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span className={styles.content}>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={styles.dismiss}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
