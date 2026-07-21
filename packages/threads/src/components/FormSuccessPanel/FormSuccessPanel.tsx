import type { HTMLAttributes } from "react";
import styles from "./FormSuccessPanel.module.css";

export interface FormSuccessPanelProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  message: string;
}

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Presentational only — the consuming app decides when to mount/unmount this after a form submit. */
export function FormSuccessPanel({ title, message, className, ...rest }: FormSuccessPanelProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[styles.panel, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className={styles.icon}>
        <CheckIcon />
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message}</div>
    </div>
  );
}
