import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Callout.module.css";

export type CalloutVariant = "success" | "warning" | "error" | "info";

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  /** Optional leading icon. Renders with aria-hidden. */
  icon?: ReactNode;
}

const defaultIcons: Record<CalloutVariant, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
};

const variantRole: Record<CalloutVariant, string> = {
  success: "status",
  warning: "note",
  error:   "alert",
  info:    "note",
};

export function Callout({
  variant = "info",
  title,
  children,
  icon,
  className,
  ...rest
}: CalloutProps) {
  return (
    <div
      role={variantRole[variant]}
      className={[styles.callout, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon ?? defaultIcons[variant]}
      </span>
      <div className={styles.body}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
