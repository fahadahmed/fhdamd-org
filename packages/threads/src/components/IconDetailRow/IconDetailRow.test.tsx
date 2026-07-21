import { render, screen } from "@testing-library/react";
import { IconDetailRow } from "./IconDetailRow";

describe("IconDetailRow", () => {
  it("renders the value", () => {
    render(<IconDetailRow icon={<svg />} value="Melbourne, VIC" />);
    expect(screen.getByText("Melbourne, VIC")).toBeInTheDocument();
  });

  it("renders the label in labeled variant", () => {
    render(<IconDetailRow icon={<svg />} label="Email" value="fahad@example.com" variant="labeled" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("does not render a label in compact variant even if provided", () => {
    render(<IconDetailRow icon={<svg />} label="Email" value="fahad@example.com" variant="compact" />);
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("hides the icon wrapper from the accessibility tree", () => {
    const { container } = render(<IconDetailRow icon={<svg />} value="Melbourne, VIC" />);
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<IconDetailRow icon={<svg />} value="x" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    render(<IconDetailRow icon={<svg />} value="x" data-testid="row" />);
    expect(screen.getByTestId("row")).toBeInTheDocument();
  });
});
