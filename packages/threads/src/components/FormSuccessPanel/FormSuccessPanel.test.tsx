import { render, screen } from "@testing-library/react";
import { FormSuccessPanel } from "./FormSuccessPanel";

describe("FormSuccessPanel", () => {
  it("renders the title and message", () => {
    render(<FormSuccessPanel title="Message sent." message="I'll be in touch soon." />);
    expect(screen.getByText("Message sent.")).toBeInTheDocument();
    expect(screen.getByText("I'll be in touch soon.")).toBeInTheDocument();
  });

  it("announces itself via role=status", () => {
    render(<FormSuccessPanel title="Sent" message="Thanks" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<FormSuccessPanel title="Sent" message="Thanks" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
