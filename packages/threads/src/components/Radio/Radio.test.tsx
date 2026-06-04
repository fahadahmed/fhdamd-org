import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Radio } from "./Radio";

describe("Radio — rendering", () => {
  it("renders with label", () => {
    render(<Radio label="Too much on" name="defer" />);
    expect(screen.getByText("Too much on")).toBeInTheDocument();
  });

  it("renders an accessible radio input", () => {
    render(<Radio label="Option A" name="group" />);
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(<Radio label="Option" name="g" />);
    expect(screen.getByRole("radio")).not.toBeChecked();
  });

  it("is checked when defaultChecked=true", () => {
    render(<Radio label="Option" name="g" defaultChecked />);
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("is disabled when disabled=true", () => {
    render(<Radio label="Option" name="g" disabled />);
    expect(screen.getByRole("radio")).toBeDisabled();
  });
});

describe("Radio — interaction", () => {
  it("selects on click", async () => {
    const user = userEvent.setup();
    render(<Radio label="Option A" name="group" />);
    await user.click(screen.getByRole("radio"));
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("only one radio selected in a group", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Radio label="A" name="g" />
        <Radio label="B" name="g" />
      </>
    );
    const [a, b] = screen.getAllByRole("radio");
    await user.click(a);
    await user.click(b);
    expect(a).not.toBeChecked();
    expect(b).toBeChecked();
  });

  it("calls onChange when selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Radio label="Option" name="g" onChange={onChange} />);
    await user.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
