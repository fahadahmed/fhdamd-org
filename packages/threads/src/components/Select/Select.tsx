import { useId } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import f from "../Input/formField.module.css";
import styles from "./Select.module.css";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode; /* <option> / <optgroup> elements */
}

const CaretIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
    className={styles.caret}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export function Select({
  label,
  hint,
  error,
  required,
  disabled,
  id: providedId,
  className,
  children,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const id = providedId ?? autoId;

  const selectCls = [
    f.input,
    styles.select,
    error ? f["input--error"] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={f.field}>
      {label && (
        <label
          htmlFor={id}
          className={[f.label, disabled ? f["label--disabled"] : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
          {required && <span className={f.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={styles.wrapper}>
        <select
          id={id}
          disabled={disabled}
          required={required}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          aria-invalid={error ? true : undefined}
          className={selectCls}
          {...rest}
        >
          {children}
        </select>
        <CaretIcon />
      </div>
      {hint && !error && (
        <span id={`${id}-hint`} className={f.hint}>{hint}</span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className={f.error}>{error}</span>
      )}
    </div>
  );
}
