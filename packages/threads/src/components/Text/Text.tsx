import type { ElementType, HTMLAttributes, ReactNode } from "react";
import styles from "./Text.module.css";

export type TextSize   = "xs" | "sm" | "base" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
export type TextFamily = "display" | "serif" | "mono";
export type TextColor  = "1" | "2" | "3" | "4" | "inverse" | "inverse-2" | "accent" | "accent-text" | "sage" | "sage-text";
export type TextAlign  = "start" | "center" | "end";
export type TextAs     = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label" | "legend" | "strong" | "em";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextAs;
  size?: TextSize;
  family?: TextFamily;
  color?: TextColor;
  align?: TextAlign;
  /** font-variation-settings wght axis (display family only) */
  weight?: 300 | 380 | 400 | 500 | 550 | 560 | 600 | 650 | 680 | 700 | 800;
  /** font-variation-settings wdth axis (display family only) */
  width?: 75 | 80 | 85 | 90 | 92 | 95 | 100;
  italic?: boolean;
  children: ReactNode;
}

export function Text({
  as: Tag = "p",
  size = "base",
  family = "display",
  color = "2",
  align,
  weight,
  width,
  italic,
  className,
  style,
  children,
  ...rest
}: TextProps) {
  const cls = [
    styles.text,
    styles[`size-${size}`],
    styles[`family-${family}`],
    styles[`color-${color}`],
    align ? styles[`align-${align}`] : "",
    italic ? styles.italic : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const varSettings =
    family === "display" && (weight !== undefined || width !== undefined)
      ? `"wdth" ${width ?? 90}, "wght" ${weight ?? 400}`
      : undefined;

  return (
    <Tag
      className={cls}
      style={varSettings ? { fontVariationSettings: varSettings, ...style } : style}
      {...(rest as HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
}
