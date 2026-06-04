import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox — rendering", () => {
  it("renders with label", () => {
    render(<Checkbox label="Evening planning" />);
    expect(screen.getByText("Evening planning")).toBeInTheDocument();
  });

  it("renders an accessible checkbox", () => {
    render(<Checkbox label="Evening planning" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(<Checkbox label="Label" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("is checked when defaultChecked=true", () => {
    render(<Checkbox label="Label" defaultChecked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("is disabled when disabled=true", () => {
    render(<Checkbox label="Label" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});

describe("Checkbox — interaction", () => {
  it("toggles checked state on click", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Evening planning" />);
    const cb = screen.getByRole("checkbox");
    expect(cb).not.toBeChecked();
    await user.click(cb);
    expect(cb).toBeChecked();
  });

  it("calls onChange when toggled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Label" onChange={onChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is keyboard accessible via Space", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Label" />);
    screen.getByRole("checkbox").focus();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
