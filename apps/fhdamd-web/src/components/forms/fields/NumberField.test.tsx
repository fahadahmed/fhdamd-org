import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NumberField } from "./NumberField";
import type { FieldConfig } from "../../../lib/forms/transferConfig";

const field: Extract<FieldConfig, { type: "number" }> = {
  type: "number",
  name: "passengers",
  label: "Passengers",
  min: 1,
  max: 8,
  required: true,
};

describe("NumberField", () => {
  it("renders a number input wired to the field's name and min/max", () => {
    render(<NumberField field={field} />);

    const input = screen.getByLabelText("Passengers");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("name", "passengers");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "8");
  });

  it("prefills the input with a previously entered value", () => {
    render(<NumberField field={field} defaultValue={4} />);
    expect(screen.getByLabelText("Passengers")).toHaveValue(4);
  });

  it("shows the validation error passed in", () => {
    render(<NumberField field={field} error="Passengers must be at least 1." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Passengers must be at least 1.");
  });
});
