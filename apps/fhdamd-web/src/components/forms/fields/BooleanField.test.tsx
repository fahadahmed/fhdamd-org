import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BooleanField } from "./BooleanField";
import type { FieldConfig } from "../../../lib/forms/transferConfig";

const field: Extract<FieldConfig, { type: "boolean" }> = {
  type: "boolean",
  name: "needsChildSeat",
  label: "Travelling with a child under 4?",
};

describe("BooleanField", () => {
  it("renders a checkbox wired to the field's name and label", () => {
    render(<BooleanField field={field} />);

    const checkbox = screen.getByLabelText("Travelling with a child under 4?");
    expect(checkbox).toHaveAttribute("type", "checkbox");
    expect(checkbox).toHaveAttribute("name", "needsChildSeat");
    expect(checkbox).not.toBeChecked();
  });

  it("prefills the checkbox from a previously entered value", () => {
    render(<BooleanField field={field} defaultValue={true} />);
    expect(screen.getByLabelText("Travelling with a child under 4?")).toBeChecked();
  });
});
