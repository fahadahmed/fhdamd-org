import type { HTMLAttributes, ReactNode } from "react";
import styles from "./LogoStrip.module.css";

export interface LogoStripProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export type LogoItemAlign = "center" | "start";

export interface LogoItemProps extends HTMLAttributes<HTMLDivElement> {
  /** The logo mark itself — an <img> or inline <svg>, consumer-owned. */
  logo: ReactNode;
  label: string;
  /**
   * Alignment of the mark/label column. Centering reads unevenly when label
   * text lengths vary a lot within the same strip — "start" lines both up
   * on the leading edge instead. Defaults to "center" for backwards compatibility.
   */
  align?: LogoItemAlign;
}

const alignClass: Record<LogoItemAlign, string> = {
  center: styles.alignCenter,
  start:  styles.alignStart,
};

export function LogoStrip({ children, className, ...rest }: LogoStripProps) {
  return (
    <div className={[styles.strip, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function LogoItem({ logo, label, align = "center", className, ...rest }: LogoItemProps) {
  return (
    <div
      className={[styles.item, alignClass[align], className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className={styles.mark}>{logo}</div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
