import { render, screen } from "@testing-library/react";
import { SectionHeader } from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders title", () => {
    render(<SectionHeader title="Everything your documents need" />);
    expect(screen.getByText("Everything your documents need")).toBeInTheDocument();
  });

  it("renders eyebrow when provided", () => {
    render(<SectionHeader title="Title" eyebrow="PDF operations" />);
    expect(screen.getByText("PDF operations")).toBeInTheDocument();
  });

  it("renders intro when provided", () => {
    render(<SectionHeader title="Title" intro="Four tools live now." />);
    expect(screen.getByText("Four tools live now.")).toBeInTheDocument();
  });

  it("does not render eyebrow when omitted", () => {
    render(<SectionHeader title="Title" />);
    expect(screen.queryByText("PDF operations")).not.toBeInTheDocument();
  });

  it("renders title as <h2> by default", () => {
    const { container } = render(<SectionHeader title="Title" />);
    expect(container.querySelector("h2")).toBeInTheDocument();
  });

  it("renders title as <h3> when as=h3", () => {
    const { container } = render(<SectionHeader title="Title" as="h3" />);
    expect(container.querySelector("h3")).toBeInTheDocument();
  });

  it("renders ReactNode title with em accent", () => {
    render(<SectionHeader title={<>Simple, <em>honest</em> credits</>} />);
    expect(screen.getByText("honest")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<SectionHeader title="Title" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("renders meta when provided", () => {
    render(<SectionHeader title="Title" meta="14 years" />);
    expect(screen.getByText("14 years")).toBeInTheDocument();
  });

  it("does not render meta when omitted", () => {
    render(<SectionHeader title="Title" />);
    expect(screen.queryByText("14 years")).not.toBeInTheDocument();
  });
});
