import { z } from "zod";
import type { FieldConfig, StepConfig } from "./transferConfig";

function fieldToZod(field: FieldConfig): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "text":
      schema = z.string().trim().max(field.maxLength ?? 500);
      break;
    case "select":
      schema = z.enum(field.options as [string, ...string[]]);
      break;
    case "number":
      schema = z.number().min(field.min ?? 0).max(field.max ?? Infinity);
      break;
    case "boolean":
      schema = z.boolean();
      break;
  }

  const isRequired = "required" in field && field.required;
  if (field.type === "text" && isRequired) {
    schema = (schema as z.ZodString).min(1, `${field.label} is required.`);
  }

  return isRequired || field.type === "boolean" ? schema : schema.optional();
}

export function stepToZodSchema(step: StepConfig) {
  const shape = Object.fromEntries(step.fields.map((field) => [field.name, fieldToZod(field)]));
  return z.object(shape);
}
