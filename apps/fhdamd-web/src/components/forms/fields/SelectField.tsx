import { Select } from "@fhdamd/threads";
import type { FieldConfig } from "../../../lib/forms/transferConfig";
import type { FieldComponentProps } from "./types";

type SelectFieldConfig = Extract<FieldConfig, { type: "select" }>;

export function SelectField({ field, defaultValue, error }: FieldComponentProps<SelectFieldConfig>) {
  return (
    <Select
      name={field.name}
      label={field.label}
      required={field.required}
      defaultValue={(defaultValue as string | undefined) ?? ""}
      error={error}
    >
      <option value="" disabled>
        Select an option
      </option>
      {field.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
}
