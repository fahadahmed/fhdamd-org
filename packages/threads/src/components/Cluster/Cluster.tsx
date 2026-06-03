import type { HTMLAttributes, ReactNode } from "react";
import type { SpaceScale } from "../layout.types";
import { toSpaceVar } from "../layout.types";
import styles from "./Cluster.module.css";

export type ClusterAlign   = "start" | "center" | "end" | "baseline" | "stretch";
export type ClusterJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type ClusterElement = "div" | "ul" | "ol";

export interface ClusterProps extends HTMLAttributes<HTMLElement> {
  gap?: SpaceScale;
  align?: ClusterAlign;
  justify?: ClusterJustify;
  wrap?: boolean;
  as?: ClusterElement;
  children: ReactNode;
}

const alignClass: Record<ClusterAlign, string> = {
  start:    styles.alignStart,
  center:   styles.alignCenter,
  end:      styles.alignEnd,
  baseline: styles.alignBaseline,
  stretch:  styles.alignStretch,
};

const justifyClass: Record<ClusterJustify, string> = {
  start:   styles.justifyStart,
  center:  styles.justifyCenter,
  end:     styles.justifyEnd,
  between: styles.justifyBetween,
  around:  styles.justifyAround,
  evenly:  styles.justifyEvenly,
};

export function Cluster({
  gap = 3,
  align = "center",
  justify = "start",
  wrap = true,
  as: Tag = "div",
  className,
  children,
  style,
  ...rest
}: ClusterProps) {
  return (
    <Tag
      className={[
        styles.cluster,
        alignClass[align],
        justifyClass[justify],
        !wrap ? styles.noWrap : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ gap: toSpaceVar(gap), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
