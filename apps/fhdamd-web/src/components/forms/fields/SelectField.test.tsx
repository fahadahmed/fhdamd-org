import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SelectField } from "./SelectField";
import type { FieldConfig } from "../../../lib/forms/transferConfig";

const field: Extract<FieldConfig, { type: "select" }> = {
  type: "select",
  name: "tripType",
  label: "Trip type",
  options: ["one-way", "return"],
  required: true,
};

describe("SelectField", () => {
  it("renders every option from the field config, plus a disabled placeholder", () => {
    render(<SelectField field={field} />);

    const select = screen.getByLabelText("Trip type");
    expect(select).toHaveAttribute("name", "tripType");
    expect(screen.getByRole("option", { name: "one-way" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "return" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Select an option" })).toBeDisabled();
  });

  it("prefills the select with a previously entered value", () => {
    render(<SelectField field={field} defaultValue="return" />);
    expect(screen.getByLabelText("Trip type")).toHaveValue("return");
  });

  it("shows the validation error passed in", () => {
    render(<SelectField field={field} error="Trip type is required." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Trip type is required.");
  });
});
