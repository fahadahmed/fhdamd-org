import type { HTMLAttributes, ReactNode } from "react";
import styles from "./LogoStrip.module.css";

export interface LogoStripProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface LogoItemProps extends HTMLAttributes<HTMLDivElement> {
  /** The logo mark itself — an <img> or inline <svg>, consumer-owned. */
  logo: ReactNode;
  label: string;
}

export function LogoStrip({ children, className, ...rest }: LogoStripProps) {
  return (
    <div className={[styles.strip, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function LogoItem({ logo, label, className, ...rest }: LogoItemProps) {
  return (
    <div className={[styles.item, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.mark}>{logo}</div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
