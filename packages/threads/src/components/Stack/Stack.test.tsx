import { render, screen } from "@testing-library/react";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders children", () => {
    render(<Stack><span>A</span><span>B</span></Stack>);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders as <div> by default", () => {
    const { container } = render(<Stack>Content</Stack>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it.each(["ul", "ol", "section", "article", "main"] as const)(
    "renders as <%s> when as prop is set",
    (tag) => {
      const { container } = render(<Stack as={tag}>Content</Stack>);
      expect(container.firstChild?.nodeName).toBe(tag.toUpperCase());
    }
  );

  it("applies gap as inline style using space token", () => {
    const { container } = render(<Stack gap={6}>Content</Stack>);
    expect((container.firstChild as HTMLElement).style.gap).toBe("var(--th-space-6)");
  });

  it("applies gap=0 as 0px", () => {
    const { container } = render(<Stack gap={0}>Content</Stack>);
    expect((container.firstChild as HTMLElement).style.gap).toBe("0px");
  });

  it("merges custom className", () => {
    const { container } = render(<Stack className="custom">Content</Stack>);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("merges custom style", () => {
    const { container } = render(<Stack style={{ color: "red" }}>Content</Stack>);
    expect(container.firstChild).toHaveStyle({ color: "red" });
  });
});
