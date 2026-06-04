import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./Select";

const Options = () => (
  <>
    <option value="">Select…</option>
    <option value="15">15 minutes</option>
    <option value="30">30 minutes</option>
    <option value="60">1 hour</option>
  </>
);

describe("Select — rendering", () => {
  it("renders a <select> element", () => {
    render(<Select><Options /></Select>);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<Select><Options /></Select>);
    expect(screen.getByRole("option", { name: "15 minutes" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "30 minutes" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1 hour" })).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Select label="Effort estimate"><Options /></Select>);
    expect(screen.getByText("Effort estimate")).toBeInTheDocument();
  });

  it("associates label with select via htmlFor/id", () => {
    render(<Select label="Effort estimate" id="effort"><Options /></Select>);
    expect(screen.getByLabelText("Effort estimate")).toBeInTheDocument();
  });

  it("renders hint text", () => {
    render(<Select label="Frequency" hint="How often this repeats."><Options /></Select>);
    expect(screen.getByText("How often this repeats.")).toBeInTheDocument();
  });

  it("renders error with role=alert", () => {
    render(<Select label="Estimate" error="Please select an option."><Options /></Select>);
    expect(screen.getByRole("alert")).toHaveTextContent("Please select an option.");
  });

  it("hides hint when error is present", () => {
    render(<Select label="Field" hint="Hint." error="Error."><Options /></Select>);
    expect(screen.queryByText("Hint.")).not.toBeInTheDocument();
    expect(screen.getByText("Error.")).toBeInTheDocument();
  });

  it("renders required asterisk when required", () => {
    render(<Select label="Estimate" required><Options /></Select>);
    expect(screen.getByText("*", { exact: false })).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Select label="Estimate" disabled><Options /></Select>);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("sets aria-invalid when error is provided", () => {
    render(<Select label="Field" error="Required."><Options /></Select>);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("renders the custom caret SVG", () => {
    const { container } = render(<Select><Options /></Select>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

describe("Select — interaction", () => {
  it("changes value on selection", async () => {
    const user = userEvent.setup();
    render(<Select label="Effort"><Options /></Select>);
    await user.selectOptions(screen.getByRole("combobox"), "30");
    expect(screen.getByRole("combobox")).toHaveValue("30");
  });

  it("calls onChange on selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select label="Effort" onChange={onChange}><Options /></Select>);
    await user.selectOptions(screen.getByRole("combobox"), "15");
    expect(onChange).toHaveBeenCalled();
  });
});
