import type { FieldConfig } from "../../../lib/forms/transferConfig";

export interface FieldComponentProps<F extends FieldConfig = FieldConfig> {
  field: F;
  defaultValue?: unknown;
  error?: string;
}
