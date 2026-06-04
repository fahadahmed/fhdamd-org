import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Radio.module.css";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Radio({
  label,
  disabled,
  id: providedId,
  className,
  ...rest
}: RadioProps) {
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
      <input
        type="radio"
        id={id}
        disabled={disabled}
        className={styles.input}
        {...rest}
      />
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </label>
  );
}
