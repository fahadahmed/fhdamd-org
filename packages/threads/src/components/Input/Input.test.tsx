import { render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input — rendering", () => {
  it("renders an <input> element", () => {
    const { container } = render(<Input />);
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Input label="Full name" />);
    expect(screen.getByText("Full name")).toBeInTheDocument();
  });

  it("associates label with input via htmlFor/id", () => {
    render(<Input label="Full name" id="name" />);
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
  });

  it("renders hint text", () => {
    render(<Input label="Email" hint="Used for sign-in." />);
    expect(screen.getByText("Used for sign-in.")).toBeInTheDocument();
  });

  it("renders error message with role=alert", () => {
    render(<Input label="Title" error="Required." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required.");
  });

  it("renders success message", () => {
    render(<Input label="Title" success="Looks good." />);
    expect(screen.getByText("Looks good.")).toBeInTheDocument();
  });

  it("does not render error and hint simultaneously — error wins", () => {
    render(<Input label="Field" hint="Hint text." error="Error text." />);
    expect(screen.queryByText("Hint text.")).not.toBeInTheDocument();
    expect(screen.getByText("Error text.")).toBeInTheDocument();
  });

  it("renders required asterisk when required", () => {
    render(<Input label="Title" required />);
    expect(screen.getByText("*", { exact: false })).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Input label="Field" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("sets aria-invalid when error is provided", () => {
    render(<Input label="Field" error="Required." />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("sets aria-describedby to error id when error provided", () => {
    render(<Input label="Field" id="f1" error="Required." />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "f1-error");
  });
});
