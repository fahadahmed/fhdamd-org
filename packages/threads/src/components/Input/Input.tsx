import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import f from "./formField.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
}

export function Input({
  label,
  hint,
  error,
  success,
  required,
  disabled,
  id: providedId,
  className,
  ...rest
}: InputProps) {
  const autoId = useId();
  const id = providedId ?? autoId;

  const inputCls = [
    f.input,
    error   ? f["input--error"]   : "",
    success && !error ? f["input--success"] : "",
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
      <input
        id={id}
        disabled={disabled}
        required={required}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        aria-invalid={error ? true : undefined}
        className={inputCls}
        {...rest}
      />
      {hint && !error && (
        <span id={`${id}-hint`} className={f.hint}>{hint}</span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className={f.error}>{error}</span>
      )}
      {success && !error && (
        <span className={f.success}>{success}</span>
      )}
    </div>
  );
}
