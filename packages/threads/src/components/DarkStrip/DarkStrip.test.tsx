import { render, screen } from "@testing-library/react";
import { DarkStrip } from "./DarkStrip";

describe("DarkStrip", () => {
  it("renders heading", () => {
    render(<DarkStrip heading="No subscription. Just results." />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("No subscription. Just results.");
  });

  it("renders eyebrow when provided", () => {
    render(<DarkStrip heading="Title" eyebrow="Ready to get started" />);
    expect(screen.getByText("Ready to get started")).toBeInTheDocument();
  });

  it("does not render eyebrow when omitted", () => {
    render(<DarkStrip heading="Title" />);
    expect(screen.queryByText("Ready to get started")).not.toBeInTheDocument();
  });

  it("renders body when provided", () => {
    render(<DarkStrip heading="Title" body="Create a free account." />);
    expect(screen.getByText("Create a free account.")).toBeInTheDocument();
  });

  it("renders actions slot", () => {
    render(<DarkStrip heading="Title" actions={<button>Get started</button>} />);
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
  });

  it("renders ReactNode heading with em", () => {
    render(<DarkStrip heading={<>Just <em>results</em>.</>} />);
    expect(screen.getByText("results")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<DarkStrip heading="Title" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it.each(["center", "start"] as const)("renders align=%s without throwing", (align) => {
    expect(() => render(<DarkStrip heading="Title" align={align} />)).not.toThrow();
  });
});
