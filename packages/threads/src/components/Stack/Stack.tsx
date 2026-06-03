import type { HTMLAttributes, ReactNode } from "react";
import type { SpaceScale } from "../layout.types";
import { toSpaceVar } from "../layout.types";
import styles from "./Stack.module.css";

export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackElement = "div" | "ul" | "ol" | "section" | "article" | "main";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  gap?: SpaceScale;
  align?: StackAlign;
  as?: StackElement;
  children: ReactNode;
}

const alignClass: Record<StackAlign, string> = {
  start:   styles.alignStart,
  center:  styles.alignCenter,
  end:     styles.alignEnd,
  stretch: styles.alignStretch,
};

export function Stack({
  gap = 4,
  align = "stretch",
  as: Tag = "div",
  className,
  children,
  style,
  ...rest
}: StackProps) {
  return (
    <Tag
      className={[styles.stack, alignClass[align], className]
        .filter(Boolean)
        .join(" ")}
      style={{ gap: toSpaceVar(gap), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
