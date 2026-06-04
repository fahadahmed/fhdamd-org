import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import f from "../Input/formField.module.css";
import styles from "./Textarea.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function Textarea({
  label,
  hint,
  error,
  required,
  disabled,
  id: providedId,
  className,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const id = providedId ?? autoId;

  const cls = [
    f.input,
    styles.textarea,
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
      <textarea
        id={id}
        disabled={disabled}
        required={required}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        aria-invalid={error ? true : undefined}
        className={cls}
        {...rest}
      />
      {hint && !error && (
        <span id={`${id}-hint`} className={f.hint}>{hint}</span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className={f.error}>{error}</span>
      )}
    </div>
  );
}
