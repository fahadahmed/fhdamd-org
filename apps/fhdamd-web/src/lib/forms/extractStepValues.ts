import type { FieldConfig } from "./transferConfig";

/**
 * FormData only ever hands back strings (and omits unchecked checkboxes
 * entirely) — this coerces a step's raw FormData into the typed shape
 * stepToZodSchema() expects, derived from the same FieldConfig so a new
 * field type can't add rendering/validation without also getting extraction.
 */
export function extractStepValues(formData: FormData, fields: FieldConfig[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const field of fields) {
    switch (field.type) {
      case "number": {
        const raw = formData.get(field.name);
        values[field.name] = raw === null || raw === "" ? undefined : Number(raw);
        break;
      }
      case "boolean":
        values[field.name] = formData.get(field.name) === "on";
        break;
      case "text":
      case "select":
        values[field.name] = formData.get(field.name) ?? "";
        break;
    }
  }

  return values;
}
