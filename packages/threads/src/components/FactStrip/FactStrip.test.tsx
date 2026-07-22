import { render, screen } from "@testing-library/react";
import { FactStrip } from "./FactStrip";

const facts = [
  { label: "Client", value: "RZest Engineers" },
  { label: "Timeline", value: "Under 3 weeks" },
];

describe("FactStrip", () => {
  it("renders every fact's label and value", () => {
    render(<FactStrip facts={facts} />);
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("RZest Engineers")).toBeInTheDocument();
    expect(screen.getByText("Timeline")).toBeInTheDocument();
    expect(screen.getByText("Under 3 weeks")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<FactStrip facts={facts} className="custom" data-testid="strip" />);
    expect(screen.getByTestId("strip")).toHaveClass("custom");
  });
});
