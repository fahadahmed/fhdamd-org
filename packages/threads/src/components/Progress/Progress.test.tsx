import { render, screen } from "@testing-library/react";
import { Progress } from "./Progress";

describe("Progress — rendering", () => {
  it("renders a progressbar", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow correctly", () => {
    render(<Progress value={74} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "74");
  });

  it("clamps value to 0 when below 0", () => {
    render(<Progress value={-10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("clamps value to 100 when above 100", () => {
    render(<Progress value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("renders label when provided", () => {
    render(<Progress value={50} label="Completion rate" />);
    expect(screen.getByText("Completion rate")).toBeInTheDocument();
  });

  it("renders value percentage when showValue=true", () => {
    render(<Progress value={74} showValue />);
    expect(screen.getByText("74%")).toBeInTheDocument();
  });

  it("does not render value when showValue is omitted", () => {
    render(<Progress value={74} label="Rate" />);
    expect(screen.queryByText("74%")).not.toBeInTheDocument();
  });

  it("sets aria-label from label prop", () => {
    render(<Progress value={50} label="Processing" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Processing");
  });

  it.each(["sage", "terra", "warning", "error", "ink"] as const)(
    "renders variant=%s without throwing",
    (variant) => {
      expect(() => render(<Progress value={50} variant={variant} />)).not.toThrow();
    }
  );
});
