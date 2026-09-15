import type { ComponentType } from "react";
import { fieldComponents } from "./fields/registry";
import type { FieldComponentProps } from "./fields/types";

/**
 * Thin dispatcher over the per-type field registry — this is the one place
 * the discriminated union's narrowing is given up (the cast below); every
 * individual field component stays fully type-narrowed internally.
 */
export function FieldRenderer({ field, defaultValue, error }: FieldComponentProps) {
  const Component = fieldComponents[field.type] as ComponentType<FieldComponentProps>;
  return <Component field={field} defaultValue={defaultValue} error={error} />;
}
