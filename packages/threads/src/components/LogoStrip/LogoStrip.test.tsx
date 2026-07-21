import { render, screen } from "@testing-library/react";
import { LogoStrip, LogoItem } from "./LogoStrip";

describe("LogoStrip", () => {
  it("renders LogoItem children", () => {
    render(
      <LogoStrip>
        <LogoItem logo={<svg />} label="Ernst & Young" />
        <LogoItem logo={<svg />} label="ANZ Bank" />
      </LogoStrip>
    );
    expect(screen.getByText("Ernst & Young")).toBeInTheDocument();
    expect(screen.getByText("ANZ Bank")).toBeInTheDocument();
  });

  it("merges custom className on LogoStrip", () => {
    const { container } = render(
      <LogoStrip className="custom">
        <LogoItem logo={<svg />} label="X" />
      </LogoStrip>
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("merges custom className on LogoItem", () => {
    render(<LogoItem logo={<svg />} label="X" className="custom" data-testid="item" />);
    expect(screen.getByTestId("item")).toHaveClass("custom");
  });
});
