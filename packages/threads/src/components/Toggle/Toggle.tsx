import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Toggle.module.css";

/** `ink` and `sage` are deprecated aliases of `accent` in Threads 2.0. */
export type ToggleVariant = "accent" | "ink" | "sage" | "terra";

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  variant?: ToggleVariant;
}

export function Toggle({
  label,
  variant = "accent",
  disabled,
  id: providedId,
  className,
  ...rest
}: ToggleProps) {
  const autoId = useId();
  const id = providedId ?? autoId;

  return (
    <label
      htmlFor={id}
      className={[
        styles.wrapper,
        disabled ? styles.disabled : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.track}>
        <input
          type="checkbox"
          role="switch"
          id={id}
          disabled={disabled}
          className={[styles.input, styles[variant]].join(" ")}
          {...rest}
        />
        <span className={styles.thumb} aria-hidden="true" />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
