import { render, screen } from "@testing-library/react";
import { Callout } from "./Callout";

describe("Callout — rendering", () => {
  it("renders children", () => {
    render(<Callout>Five more operations coming soon.</Callout>);
    expect(screen.getByText("Five more operations coming soon.")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Callout title="Update available">New version released.</Callout>);
    expect(screen.getByText("Update available")).toBeInTheDocument();
  });

  it("does not render title element when omitted", () => {
    const { container } = render(<Callout>Body only.</Callout>);
    expect(container.querySelector("[class*='title']")).not.toBeInTheDocument();
  });

  it.each(["success", "warning", "error", "info"] as const)(
    "renders variant=%s without throwing",
    (variant) => {
      expect(() =>
        render(<Callout variant={variant}>Message.</Callout>)
      ).not.toThrow();
    }
  );

  it("renders default icon", () => {
    const { container } = render(<Callout variant="success">Done.</Callout>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(
      <Callout icon={<svg data-testid="custom-icon" />}>Message.</Callout>
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<Callout className="custom">Message.</Callout>);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("Callout — accessibility", () => {
  it("error variant has role=alert", () => {
    render(<Callout variant="error">Error message.</Callout>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("success variant has role=status", () => {
    render(<Callout variant="success">Success message.</Callout>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("icon is hidden from accessibility tree", () => {
    const { container } = render(<Callout variant="info">Message.</Callout>);
    const icon = container.querySelector("[aria-hidden='true']");
    expect(icon).toBeInTheDocument();
  });
});
