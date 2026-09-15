import { Input } from "@fhdamd/threads";
import type { FieldConfig } from "../../../lib/forms/transferConfig";
import type { FieldComponentProps } from "./types";

type TextFieldConfig = Extract<FieldConfig, { type: "text" }>;

export function TextField({ field, defaultValue, error }: FieldComponentProps<TextFieldConfig>) {
  return (
    <Input
      name={field.name}
      label={field.label}
      required={field.required}
      maxLength={field.maxLength}
      defaultValue={defaultValue as string | undefined}
      error={error}
    />
  );
}
