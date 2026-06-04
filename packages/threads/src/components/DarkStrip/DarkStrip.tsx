import type { HTMLAttributes, ReactNode } from "react";
import styles from "./DarkStrip.module.css";

export interface DarkStripProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  heading: ReactNode;
  body?: string;
  actions?: ReactNode;
  align?: "center" | "start";
}

export function DarkStrip({
  eyebrow,
  heading,
  body,
  actions,
  align = "center",
  className,
  ...rest
}: DarkStripProps) {
  return (
    <div
      className={[
        styles.strip,
        align === "center" ? styles.centered : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {eyebrow && (
        <div className={styles.eyebrow} aria-hidden="true">{eyebrow}</div>
      )}
      <h2 className={styles.heading}>{heading}</h2>
      {body && <p className={styles.body}>{body}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
