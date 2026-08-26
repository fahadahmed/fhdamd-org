import { render, screen, fireEvent } from "@testing-library/react";
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
    // Default label icon + the expand toggle's own icon.
    expect(container.querySelectorAll("svg").length).toBe(2);
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

  describe("expand/collapse", () => {
    it("starts collapsed: expand toggle visible, nothing else rendered", () => {
      render(<MermaidDiagramCard label="l"><div /></MermaidDiagramCard>);
      expect(screen.getByTestId("mermaid-expand-toggle")).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByTestId("mermaid-backdrop")).not.toBeInTheDocument();
      expect(screen.queryByTestId("mermaid-close-fixed")).not.toBeInTheDocument();
    });

    it("expanding hides the label row's toggle and shows the backdrop + fixed close button instead", () => {
      render(<MermaidDiagramCard label="l"><div /></MermaidDiagramCard>);
      fireEvent.click(screen.getByTestId("mermaid-expand-toggle"));
      // Only one control should exist at a time — not two doing the same thing.
      expect(screen.queryByTestId("mermaid-expand-toggle")).not.toBeInTheDocument();
      expect(screen.getByTestId("mermaid-backdrop")).toBeInTheDocument();
      expect(screen.getByTestId("mermaid-close-fixed")).toBeInTheDocument();
    });

    it("collapses on clicking the backdrop (including on top of the diagram, which passes through to it)", () => {
      render(<MermaidDiagramCard label="l"><div /></MermaidDiagramCard>);
      fireEvent.click(screen.getByTestId("mermaid-expand-toggle"));
      fireEvent.click(screen.getByTestId("mermaid-backdrop"));
      expect(screen.getByTestId("mermaid-expand-toggle")).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByTestId("mermaid-close-fixed")).not.toBeInTheDocument();
    });

    it("collapses on clicking the fixed close button", () => {
      render(<MermaidDiagramCard label="l"><div /></MermaidDiagramCard>);
      fireEvent.click(screen.getByTestId("mermaid-expand-toggle"));
      fireEvent.click(screen.getByTestId("mermaid-close-fixed"));
      expect(screen.getByTestId("mermaid-expand-toggle")).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByTestId("mermaid-close-fixed")).not.toBeInTheDocument();
    });

    it("collapses on Escape", () => {
      render(<MermaidDiagramCard label="l"><div /></MermaidDiagramCard>);
      fireEvent.click(screen.getByTestId("mermaid-expand-toggle"));
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.getByTestId("mermaid-expand-toggle")).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps the same child DOM node across expand/collapse instead of unmounting it", () => {
      render(
        <MermaidDiagramCard label="l">
          <svg data-testid="diagram" />
        </MermaidDiagramCard>
      );
      const diagramBeforeExpand = screen.getByTestId("diagram");
      fireEvent.click(screen.getByTestId("mermaid-expand-toggle"));
      expect(screen.getByTestId("diagram")).toBe(diagramBeforeExpand);
    });
  });
});
