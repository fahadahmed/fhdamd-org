import { render, screen } from "@testing-library/react";
import { Grid, GridItem, AutoGrid } from "./Grid";

describe("Grid", () => {
  it("renders children", () => {
    render(<Grid><span>A</span><span>B</span></Grid>);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders as <div> by default", () => {
    const { container } = render(<Grid>Content</Grid>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("applies cols and gap as inline styles", () => {
    const { container } = render(<Grid cols={3} gap={6}>Content</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
    expect(el.style.gap).toBe("var(--th-space-6)");
  });

  it("defaults to 12 columns", () => {
    const { container } = render(<Grid>Content</Grid>);
    expect((container.firstChild as HTMLElement).style.gridTemplateColumns).toBe("repeat(12, 1fr)");
  });

  it("merges custom className", () => {
    const { container } = render(<Grid className="custom">Content</Grid>);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("GridItem", () => {
  it("renders children", () => {
    render(<GridItem>Item content</GridItem>);
    expect(screen.getByText("Item content")).toBeInTheDocument();
  });

  it("applies span as gridColumn inline style", () => {
    const { container } = render(<GridItem span={6}>Content</GridItem>);
    expect(container.firstChild).toHaveStyle({ gridColumn: "span 6" });
  });

  it("defaults to span 1", () => {
    const { container } = render(<GridItem>Content</GridItem>);
    expect(container.firstChild).toHaveStyle({ gridColumn: "span 1" });
  });
});

describe("AutoGrid", () => {
  it("renders children", () => {
    render(<AutoGrid><span>A</span><span>B</span></AutoGrid>);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("applies auto-fill grid with minColWidth", () => {
    const { container } = render(
      <AutoGrid minColWidth="320px" gap={4}>Content</AutoGrid>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe("repeat(auto-fill, minmax(320px, 1fr))");
    expect(el.style.gap).toBe("var(--th-space-4)");
  });

  it("defaults to minColWidth=280px", () => {
    const { container } = render(<AutoGrid>Content</AutoGrid>);
    expect((container.firstChild as HTMLElement).style.gridTemplateColumns).toBe(
      "repeat(auto-fill, minmax(280px, 1fr))"
    );
  });
});
