import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders heading", () => {
    render(<Hero heading="Simple PDF tools." />);
    expect(screen.getByRole("heading", { level: 1, name: "Simple PDF tools." })).toBeInTheDocument();
  });

  it("renders eyebrow when provided", () => {
    render(<Hero heading="Title" eyebrow="PDF tools that respect your time" />);
    expect(screen.getByText("PDF tools that respect your time")).toBeInTheDocument();
  });

  it("does not render eyebrow when omitted", () => {
    render(<Hero heading="Title" />);
    expect(screen.queryByText("PDF tools that respect your time")).not.toBeInTheDocument();
  });

  it("renders subheading when provided", () => {
    render(<Hero heading="Title" subheading="Beautifully honest pricing." />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Beautifully honest pricing.");
  });

  it("renders body when provided", () => {
    render(<Hero heading="Title" body="Merge, protect, convert." />);
    expect(screen.getByText("Merge, protect, convert.")).toBeInTheDocument();
  });

  it("renders chips with accessible label", () => {
    render(<Hero heading="Title" chips={["No subscription", "Credits never expire"]} />);
    expect(screen.getByRole("list", { name: "Key features" })).toBeInTheDocument();
    expect(screen.getByText("No subscription")).toBeInTheDocument();
    expect(screen.getByText("Credits never expire")).toBeInTheDocument();
  });

  it("renders actions slot", () => {
    render(<Hero heading="Title" actions={<button>Get started</button>} />);
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
  });

  it("renders as <section>", () => {
    const { container } = render(<Hero heading="Title" />);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("merges custom className", () => {
    const { container } = render(<Hero heading="Title" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
