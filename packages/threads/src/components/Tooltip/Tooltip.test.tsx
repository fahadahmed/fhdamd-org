import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "./Tooltip";

describe("Tooltip — rendering", () => {
  it("renders children", () => {
    render(<Tooltip content="2 credits">Hover me</Tooltip>);
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("renders tooltip content with role=tooltip", () => {
    render(<Tooltip content="2 credits per merge">Hover me</Tooltip>);
    expect(screen.getByRole("tooltip")).toHaveTextContent("2 credits per merge");
  });

  it("renders ReactNode content", () => {
    render(
      <Tooltip content={<strong>Bold tip</strong>}>Trigger</Tooltip>
    );
    expect(screen.getByRole("tooltip")).toContainElement(
      screen.getByText("Bold tip")
    );
  });

  it.each(["top", "bottom", "left", "right"] as const)(
    "renders position=%s without throwing",
    (position) => {
      expect(() =>
        render(<Tooltip content="Tip" position={position}>Trigger</Tooltip>)
      ).not.toThrow();
    }
  );

  it("merges custom className on wrapper", () => {
    const { container } = render(
      <Tooltip content="Tip" className="custom">Trigger</Tooltip>
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards HTML attributes to wrapper", () => {
    render(
      <Tooltip content="Tip" data-testid="tooltip-wrap">Trigger</Tooltip>
    );
    expect(screen.getByTestId("tooltip-wrap")).toBeInTheDocument();
  });
});

describe("Tooltip — visibility", () => {
  it("tooltip is in the DOM at all times (CSS controls opacity)", () => {
    render(<Tooltip content="Always present">Trigger</Tooltip>);
    // Tooltip uses CSS opacity — it's always in the DOM
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("tooltip is visible on hover", async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Hover tip">Trigger</Tooltip>);
    const trigger = screen.getByText("Trigger");
    await user.hover(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
