import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextField } from "./TextField";
import type { FieldConfig } from "../../../lib/forms/transferConfig";

const field: Extract<FieldConfig, { type: "text" }> = {
  type: "text",
  name: "pickup",
  label: "Pickup location",
  required: true,
  maxLength: 200,
};

describe("TextField", () => {
  it("renders an input wired to the field's name, label, and required state", () => {
    render(<TextField field={field} />);

    const input = screen.getByLabelText("Pickup location");
    expect(input).toHaveAttribute("name", "pickup");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("maxLength", "200");
  });

  it("prefills the input with a previously entered value", () => {
    render(<TextField field={field} defaultValue="Airport" />);
    expect(screen.getByLabelText("Pickup location")).toHaveValue("Airport");
  });

  it("shows the validation error passed in", () => {
    render(<TextField field={field} error="Pickup location is required." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Pickup location is required.");
  });
});
