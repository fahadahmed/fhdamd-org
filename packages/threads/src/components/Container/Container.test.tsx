import { render, screen } from "@testing-library/react";
import { Container } from "./Container";

describe("Container", () => {
  it("renders children", () => {
    render(<Container>Content</Container>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders as <div> by default", () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it.each(["main", "section", "article", "header", "footer", "nav"] as const)(
    "renders as <%s> when as prop is set",
    (tag) => {
      const { container } = render(<Container as={tag}>Content</Container>);
      expect(container.firstChild?.nodeName).toBe(tag.toUpperCase());
    }
  );

  it("merges custom className", () => {
    const { container } = render(<Container className="custom">Content</Container>);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    render(<Container data-testid="container">Content</Container>);
    expect(screen.getByTestId("container")).toBeInTheDocument();
  });
});
