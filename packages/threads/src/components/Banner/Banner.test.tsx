import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Banner } from "./Banner";

describe("Banner — rendering", () => {
  it("renders children", () => {
    render(<Banner>Notifications are off.</Banner>);
    expect(screen.getByText("Notifications are off.")).toBeInTheDocument();
  });

  it.each(["success", "warning", "error", "info"] as const)(
    "renders variant=%s without throwing",
    (variant) => {
      expect(() =>
        render(<Banner variant={variant}>Message.</Banner>)
      ).not.toThrow();
    }
  );

  it("renders dismiss button when onDismiss is provided", () => {
    render(<Banner onDismiss={() => {}}>Message.</Banner>);
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("does not render dismiss button when onDismiss is omitted", () => {
    render(<Banner>Message.</Banner>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Banner onDismiss={onDismiss}>Message.</Banner>);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("merges custom className", () => {
    const { container } = render(<Banner className="custom">Message.</Banner>);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("Banner — accessibility", () => {
  it("error variant has role=alert", () => {
    render(<Banner variant="error">Error.</Banner>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("success variant has role=status", () => {
    render(<Banner variant="success">Success.</Banner>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
