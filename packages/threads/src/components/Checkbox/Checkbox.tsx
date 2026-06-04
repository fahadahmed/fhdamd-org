import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Checkbox({
  label,
  disabled,
  id: providedId,
  className,
  ...rest
}: CheckboxProps) {
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
        type="checkbox"
        id={id}
        disabled={disabled}
        className={styles.input}
        {...rest}
      />
      <span className={styles.box} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </label>
  );
}
