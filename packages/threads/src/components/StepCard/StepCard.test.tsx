import { render, screen } from "@testing-library/react";
import { StepCard } from "./StepCard";

describe("StepCard", () => {
  it("renders the step number", () => {
    render(<StepCard number="01" title="Create account" body="Sign up in seconds." />);
    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<StepCard number="01" title="Create account" body="Sign up in seconds." />);
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });

  it("renders the body", () => {
    render(<StepCard number="01" title="Create account" body="Sign up in seconds." />);
    expect(screen.getByText("Sign up in seconds.")).toBeInTheDocument();
  });

  it("renders as a <div>", () => {
    const { container } = render(
      <StepCard number="02" title="Buy credits" body="Three packs to choose from." />
    );
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("merges custom className", () => {
    const { container } = render(
      <StepCard number="01" title="Step" body="Body." className="custom" />
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    render(
      <StepCard number="01" title="Step" body="Body." data-testid="step" />
    );
    expect(screen.getByTestId("step")).toBeInTheDocument();
  });

  it.each(["01", "02", "03"])(
    "renders step number %s without throwing",
    (number) => {
      expect(() =>
        render(<StepCard number={number} title="Step" body="Body." />)
      ).not.toThrow();
    }
  );
});
