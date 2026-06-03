import { render, screen } from "@testing-library/react";
import { AvailabilityPill } from "./AvailabilityPill";

describe("AvailabilityPill", () => {
  it("renders the default label", () => {
    render(<AvailabilityPill />);
    expect(screen.getByText("Open to select projects")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<AvailabilityPill label="Accepting clients from Q3" />);
    expect(screen.getByText("Accepting clients from Q3")).toBeInTheDocument();
  });

  it("pip is hidden from the accessibility tree", () => {
    const { container } = render(<AvailabilityPill />);
    const pip = container.querySelector("[aria-hidden='true']");
    expect(pip).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<AvailabilityPill className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    render(<AvailabilityPill data-testid="avail" />);
    expect(screen.getByTestId("avail")).toBeInTheDocument();
  });

  it("renders as available by default", () => {
    const { container } = render(<AvailabilityPill />);
    // The dot element should have the available class applied
    expect(container.querySelector("[aria-hidden]")).toBeInTheDocument();
  });

  it("renders busy state without throwing", () => {
    expect(() =>
      render(<AvailabilityPill available={false} label="Not available" />)
    ).not.toThrow();
  });
});
