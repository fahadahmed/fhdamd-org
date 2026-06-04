import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "solid-ink"
  | "solid-terra"
  | "solid-sage"
  | "ghost"
  | "outline"
  | "subtle-terra"
  | "subtle-sage";

export type ButtonSize = "sm" | "md" | "lg";

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  className?: string;
}

interface AsButton
  extends SharedProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: never;
}

interface AsAnchor
  extends SharedProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> {
  href: string;
}

export type ButtonProps = AsButton | AsAnchor;

const variantStyles: Record<ButtonVariant, string> = {
  "solid-ink":   styles.solidInk,
  "solid-terra": styles.solidTerra,
  "solid-sage":  styles.solidSage,
  ghost:         styles.ghost,
  outline:       styles.outline,
  "subtle-terra": styles.subtleTerra,
  "subtle-sage":  styles.subtleSage,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: "",
  lg: styles.lg,
};

export function Button({
  variant = "solid-ink",
  size = "md",
  children,
  icon,
  iconPosition = "end",
  className,
  href,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.button,
    variantStyles[variant],
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && iconPosition === "start" && (
        <span className={styles.icon} aria-hidden="true">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "end" && (
        <span className={styles.icon} aria-hidden="true">{icon}</span>
      )}
    </>
  );

  if (href !== undefined) {
    return (
      <a
        href={href}
        className={cls}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}
