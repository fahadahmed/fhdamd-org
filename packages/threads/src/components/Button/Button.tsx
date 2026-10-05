import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import styles from "./Button.module.css";

export type ButtonVariant =
  /** @deprecated Threads 2.0 allows one filled colour (terra). Renders as "ghost". */
  | "solid-ink"
  | "solid-terra"
  /** @deprecated Threads 2.0 allows one filled colour (terra). Renders as "ghost". */
  | "solid-sage"
  | "ghost"
  /** Same as "ghost", but legible on a dark/inverse surface (e.g. inside DarkStrip). */
  | "ghost-inverse"
  | "outline"
  | "subtle-terra"
  | "subtle-sage"
  /** Soft alert fill with alert text. Never a filled red. */
  | "destructive";

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
  "solid-ink":   styles.ghost,
  "solid-terra": styles.solidTerra,
  "solid-sage":  styles.ghost,
  ghost:         styles.ghost,
  "ghost-inverse": styles.ghostInverse,
  outline:       styles.outline,
  "subtle-terra": styles.subtleTerra,
  "subtle-sage":  styles.subtleSage,
  destructive:   styles.destructive,
};

const deprecatedVariants = new Set<ButtonVariant>(["solid-ink", "solid-sage"]);
const warned = new Set<ButtonVariant>();

function warnDeprecatedVariant(variant: ButtonVariant) {
  if (
    !deprecatedVariants.has(variant) ||
    warned.has(variant) ||
    (typeof process !== "undefined" && process.env?.NODE_ENV === "production")
  ) {
    return;
  }
  warned.add(variant);
  console.warn(
    `[@fhdamd/threads] Button variant "${variant}" is deprecated in 2.0 and renders as "ghost". Use "solid-terra" for the one filled action on a surface.`,
  );
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: "",
  lg: styles.lg,
};

export function Button({
  variant = "solid-terra",
  size = "md",
  children,
  icon,
  iconPosition = "end",
  className,
  href,
  ...rest
}: ButtonProps) {
  warnDeprecatedVariant(variant);
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
