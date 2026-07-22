import { render, screen } from "@testing-library/react";
import { MermaidDiagramCard } from "./MermaidDiagramCard";

describe("MermaidDiagramCard", () => {
  it("renders the label and children", () => {
    render(
      <MermaidDiagramCard label="Sequence diagram · Mermaid">
        <svg data-testid="diagram" />
      </MermaidDiagramCard>
    );
    expect(screen.getByText("Sequence diagram · Mermaid")).toBeInTheDocument();
    expect(screen.getByTestId("diagram")).toBeInTheDocument();
  });

  it("renders a caption when provided", () => {
    render(
      <MermaidDiagramCard label="l" caption="Rendered from source">
        <div />
      </MermaidDiagramCard>
    );
    expect(screen.getByText("Rendered from source")).toBeInTheDocument();
  });

  it("does not render a caption when omitted", () => {
    render(<MermaidDiagramCard label="l"><div /></MermaidDiagramCard>);
    expect(screen.queryByText(/Rendered/)).not.toBeInTheDocument();
  });

  it("falls back to a default icon when none is provided", () => {
    const { container } = render(<MermaidDiagramCard label="l"><div /></MermaidDiagramCard>);
    expect(container.querySelectorAll("svg").length).toBe(1);
  });

  it("uses a custom icon when provided", () => {
    render(
      <MermaidDiagramCard label="l" icon={<span data-testid="custom-icon" />}>
        <div />
      </MermaidDiagramCard>
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<MermaidDiagramCard label="l" className="custom" data-testid="card"><div /></MermaidDiagramCard>);
    expect(screen.getByTestId("card")).toHaveClass("custom");
  });
});
