import type { HTMLAttributes, ReactNode } from "react";
import type { SpaceScale } from "../layout.types";
import { toSpaceVar } from "../layout.types";
import styles from "./Grid.module.css";

export type GridCols = 1 | 2 | 3 | 4 | 6 | 12;
export type GridSpan = 1 | 2 | 3 | 4 | 6 | 8 | 12;
export type GridElement = "div" | "ul" | "ol" | "section";

export interface GridProps extends HTMLAttributes<HTMLElement> {
  cols?: GridCols;
  gap?: SpaceScale;
  as?: GridElement;
  children: ReactNode;
}

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  span?: GridSpan;
  children: ReactNode;
}

export interface AutoGridProps extends HTMLAttributes<HTMLElement> {
  minColWidth?: string;
  gap?: SpaceScale;
  as?: GridElement;
  children: ReactNode;
}

export function Grid({
  cols = 12,
  gap = 4,
  as: Tag = "div",
  className,
  children,
  style,
  ...rest
}: GridProps) {
  return (
    <Tag
      className={[styles.grid, className].filter(Boolean).join(" ")}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: toSpaceVar(gap),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function GridItem({
  span = 1,
  className,
  children,
  style,
  ...rest
}: GridItemProps) {
  return (
    <div
      className={[styles.gridItem, className].filter(Boolean).join(" ")}
      style={{ gridColumn: `span ${span}`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function AutoGrid({
  minColWidth = "280px",
  gap = 4,
  as: Tag = "div",
  className,
  children,
  style,
  ...rest
}: AutoGridProps) {
  return (
    <Tag
      className={[styles.grid, className].filter(Boolean).join(" ")}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}, 1fr))`,
        gap: toSpaceVar(gap),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
