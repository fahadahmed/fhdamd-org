import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Tooltip.module.css";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  content: ReactNode;
  position?: TooltipPosition;
  children: ReactNode;
}

export function Tooltip({
  content,
  position = "top",
  children,
  className,
  ...rest
}: TooltipProps) {
  return (
    <span
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
      <span
        role="tooltip"
        className={[styles.tip, styles[position]].join(" ")}
      >
        {content}
      </span>
    </span>
  );
}
