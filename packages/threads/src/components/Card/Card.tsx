import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

export type CardVariant = "default" | "elevated" | "interactive" | "inverse";
export type CardAccentBar = "none" | "top" | "start";
export type CardAccentColor = "terra" | "sage";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  accentBar?: CardAccentBar;
  accentColor?: CardAccentColor;
  children: ReactNode;
  as?: "div" | "article" | "section";
}

export interface CardTitleProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default:     "",
  elevated:    styles.elevated,
  interactive: styles.interactive,
  inverse:     styles.inverse,
};

const accentBarStyles: Record<CardAccentBar, string> = {
  none:  "",
  top:   styles.accentTop,
  start: styles.accentStart,
};

const accentColorValues: Record<CardAccentColor, string> = {
  terra: "var(--th-color-accent)",
  sage:  "var(--th-color-sage)",
};

export function Card({
  variant = "default",
  accentBar = "none",
  accentColor = "terra",
  children,
  as: Tag = "div",
  className,
  style,
  ...rest
}: CardProps) {
  const cls = [
    styles.card,
    variantStyles[variant],
    accentBarStyles[accentBar],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle = {
    ...(accentBar !== "none"
      ? ({ "--card-accent": accentColorValues[accentColor] } as React.CSSProperties)
      : {}),
    ...style,
  };

  const interactiveProps =
    variant === "interactive"
      ? { tabIndex: 0, role: "button" as const }
      : {};

  return (
    <Tag className={cls} style={mergedStyle} {...interactiveProps} {...rest}>
      {children}
    </Tag>
  );
}

export function CardTitle({ children, className, ...rest }: CardTitleProps) {
  return (
    <div className={[styles.title, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...rest }: CardBodyProps) {
  return (
    <div className={[styles.body, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
