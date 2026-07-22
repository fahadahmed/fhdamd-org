import { render, screen } from "@testing-library/react";
import { StatRow } from "./StatRow";

const stats = [
  { number: "<3", unit: "wks", label: "Discovery to launch" },
  { number: "0", label: "Dev tickets since launch" },
];

describe("StatRow", () => {
  it("renders each stat's number and label", () => {
    render(<StatRow stats={stats} />);
    expect(screen.getByText("<3")).toBeInTheDocument();
    expect(screen.getByText("Discovery to launch")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Dev tickets since launch")).toBeInTheDocument();
  });

  it("renders the unit when provided", () => {
    render(<StatRow stats={stats} />);
    expect(screen.getByText("wks")).toBeInTheDocument();
  });

  it("does not render a unit element when omitted", () => {
    render(<StatRow stats={[{ number: "0", label: "x" }]} />);
    expect(screen.queryByText("wks")).not.toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<StatRow stats={stats} className="custom" data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass("custom");
  });
});
