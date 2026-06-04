import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./Textarea";

describe("Textarea — rendering", () => {
  it("renders a <textarea> element", () => {
    const { container } = render(<Textarea />);
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Textarea label="Notes" />);
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("associates label with textarea via htmlFor/id", () => {
    render(<Textarea label="Notes" id="notes" />);
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("renders hint text", () => {
    render(<Textarea label="Notes" hint="Optional. Shown only in task detail." />);
    expect(screen.getByText("Optional. Shown only in task detail.")).toBeInTheDocument();
  });

  it("renders error with role=alert", () => {
    render(<Textarea label="Message" error="Message is required." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Message is required.");
  });

  it("hides hint when error is present", () => {
    render(<Textarea label="Field" hint="Hint text." error="Error text." />);
    expect(screen.queryByText("Hint text.")).not.toBeInTheDocument();
    expect(screen.getByText("Error text.")).toBeInTheDocument();
  });

  it("renders required asterisk when required", () => {
    render(<Textarea label="Notes" required />);
    expect(screen.getByText("*", { exact: false })).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Textarea label="Notes" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("sets aria-invalid when error is provided", () => {
    render(<Textarea label="Field" error="Required." />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("sets aria-describedby to error id when error provided", () => {
    render(<Textarea label="Field" id="f1" error="Required." />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "f1-error");
  });
});

describe("Textarea — interaction", () => {
  it("accepts typed input", async () => {
    const user = userEvent.setup();
    render(<Textarea label="Notes" />);
    const ta = screen.getByRole("textbox");
    await user.type(ta, "Hello world");
    expect(ta).toHaveValue("Hello world");
  });

  it("calls onChange on input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea label="Notes" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });
});
