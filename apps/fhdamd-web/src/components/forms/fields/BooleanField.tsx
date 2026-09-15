import { Checkbox } from "@fhdamd/threads";
import type { FieldConfig } from "../../../lib/forms/transferConfig";
import type { FieldComponentProps } from "./types";

type BooleanFieldConfig = Extract<FieldConfig, { type: "boolean" }>;

// configToZod.ts never makes a boolean field optional, so it can't fail
// validation — Checkbox has no error slot to wire up, and none is needed.
export function BooleanField({ field, defaultValue }: FieldComponentProps<BooleanFieldConfig>) {
  return <Checkbox name={field.name} label={field.label} defaultChecked={Boolean(defaultValue)} />;
}
