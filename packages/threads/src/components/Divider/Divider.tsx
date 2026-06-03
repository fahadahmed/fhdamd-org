import type { HTMLAttributes } from "react";
import styles from "./Divider.module.css";

export type DividerColor = "subtle" | "default" | "strong" | "accent";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  color?: DividerColor;
}

const colorClass: Record<DividerColor, string> = {
  subtle:  styles.colorSubtle,
  default: styles.colorDefault,
  strong:  styles.colorStrong,
  accent:  styles.colorAccent,
};

export function Divider({ color = "default", className, ...rest }: DividerProps) {
  return (
    <hr
      className={[styles.divider, colorClass[color], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
