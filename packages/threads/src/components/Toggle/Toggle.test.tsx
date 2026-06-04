import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./Toggle";

describe("Toggle — rendering", () => {
  it("renders a switch", () => {
    render(<Toggle />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Toggle label="Evening planning" />);
    expect(screen.getByText("Evening planning")).toBeInTheDocument();
  });

  it("is off by default", () => {
    render(<Toggle />);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("is on when defaultChecked=true", () => {
    render(<Toggle defaultChecked />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("is disabled when disabled=true", () => {
    render(<Toggle disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it.each(["ink", "sage", "terra"] as const)(
    "renders variant=%s without throwing",
    (variant) => {
      expect(() => render(<Toggle variant={variant} />)).not.toThrow();
    }
  );
});

describe("Toggle — interaction", () => {
  it("toggles on click", async () => {
    const user = userEvent.setup();
    render(<Toggle label="Setting" />);
    const sw = screen.getByRole("switch");
    expect(sw).not.toBeChecked();
    await user.click(sw);
    expect(sw).toBeChecked();
  });

  it("calls onChange when toggled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle onChange={onChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    render(<Toggle disabled label="Disabled" />);
    const sw = screen.getByRole("switch");
    await user.click(sw);
    expect(sw).not.toBeChecked();
  });

  it("is keyboard accessible via Space", async () => {
    const user = userEvent.setup();
    render(<Toggle />);
    screen.getByRole("switch").focus();
    await user.keyboard(" ");
    expect(screen.getByRole("switch")).toBeChecked();
  });
});
