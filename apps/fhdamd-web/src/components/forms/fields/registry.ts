import type { ComponentType } from "react";
import type { FieldConfig } from "../../../lib/forms/transferConfig";
import { TextField } from "./TextField";
import { SelectField } from "./SelectField";
import { NumberField } from "./NumberField";
import { BooleanField } from "./BooleanField";

// `satisfies` keeps each component's own narrowed prop type while still
// checking the map is exhaustive over FieldConfig["type"] — adding a new
// field type without a matching entry here is a type error.
export const fieldComponents = {
  text: TextField,
  select: SelectField,
  number: NumberField,
  boolean: BooleanField,
} satisfies Record<FieldConfig["type"], ComponentType<any>>;
