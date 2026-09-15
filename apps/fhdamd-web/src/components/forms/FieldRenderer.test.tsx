import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldRenderer } from "./FieldRenderer";
import type { FieldConfig } from "../../lib/forms/transferConfig";

describe("FieldRenderer", () => {
  it("dispatches a text field to a text input", () => {
    const field: FieldConfig = { type: "text", name: "pickup", label: "Pickup location" };
    render(<FieldRenderer field={field} />);
    expect(screen.getByLabelText("Pickup location")).toHaveAttribute("name", "pickup");
  });

  it("dispatches a select field to a select element", () => {
    const field: FieldConfig = { type: "select", name: "tripType", label: "Trip type", options: ["one-way"] };
    render(<FieldRenderer field={field} />);
    expect(screen.getByLabelText("Trip type").tagName).toBe("SELECT");
  });

  it("dispatches a number field to a number input", () => {
    const field: FieldConfig = { type: "number", name: "passengers", label: "Passengers" };
    render(<FieldRenderer field={field} />);
    expect(screen.getByLabelText("Passengers")).toHaveAttribute("type", "number");
  });

  it("dispatches a boolean field to a checkbox", () => {
    const field: FieldConfig = { type: "boolean", name: "meetAndGreet", label: "Meet and greet?" };
    render(<FieldRenderer field={field} />);
    expect(screen.getByLabelText("Meet and greet?")).toHaveAttribute("type", "checkbox");
  });
});
