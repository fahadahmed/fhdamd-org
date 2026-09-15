import { Input } from "@fhdamd/threads";
import type { FieldConfig } from "../../../lib/forms/transferConfig";
import type { FieldComponentProps } from "./types";

type NumberFieldConfig = Extract<FieldConfig, { type: "number" }>;

export function NumberField({ field, defaultValue, error }: FieldComponentProps<NumberFieldConfig>) {
  return (
    <Input
      type="number"
      name={field.name}
      label={field.label}
      required={field.required}
      min={field.min}
      max={field.max}
      defaultValue={defaultValue as number | undefined}
      error={error}
    />
  );
}
