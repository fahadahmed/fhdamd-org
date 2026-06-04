import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Section.module.css";

export type SectionSize    = "sm" | "md" | "lg";
export type SectionElement = "section" | "div" | "article" | "main" | "header" | "footer";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  size?: SectionSize;
  as?: SectionElement;
  children: ReactNode;
}

const sizeClass: Record<SectionSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export function Section({
  size = "md",
  as: Tag = "section",
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <Tag
      className={[styles.section, sizeClass[size], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
