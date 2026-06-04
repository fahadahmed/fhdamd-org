import { render, screen } from "@testing-library/react";
import { Cluster } from "./Cluster";

describe("Cluster", () => {
  it("renders children", () => {
    render(<Cluster><span>A</span><span>B</span></Cluster>);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders as <div> by default", () => {
    const { container } = render(<Cluster>Content</Cluster>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it.each(["ul", "ol"] as const)("renders as <%s> when as prop is set", (tag) => {
    const { container } = render(<Cluster as={tag}>Content</Cluster>);
    expect(container.firstChild?.nodeName).toBe(tag.toUpperCase());
  });

  it("applies gap as inline style", () => {
    const { container } = render(<Cluster gap={4}>Content</Cluster>);
    expect((container.firstChild as HTMLElement).style.gap).toBe("var(--th-space-4)");
  });

  it("merges custom className", () => {
    const { container } = render(<Cluster className="custom">Content</Cluster>);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    render(<Cluster data-testid="cluster">Content</Cluster>);
    expect(screen.getByTestId("cluster")).toBeInTheDocument();
  });
});
