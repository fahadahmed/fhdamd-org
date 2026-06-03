import { render, screen } from "@testing-library/react";
import { Section } from "./Section";

describe("Section", () => {
  it("renders children", () => {
    render(<Section>Content</Section>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders as <section> by default", () => {
    const { container } = render(<Section>Content</Section>);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it.each(["div", "article", "main", "header", "footer"] as const)(
    "renders as <%s> when as prop is set",
    (tag) => {
      const { container } = render(<Section as={tag}>Content</Section>);
      expect(container.firstChild?.nodeName).toBe(tag.toUpperCase());
    }
  );

  it.each(["sm", "md", "lg"] as const)(
    "renders size=%s without throwing",
    (size) => {
      expect(() => render(<Section size={size}>Content</Section>)).not.toThrow();
    }
  );

  it("merges custom className", () => {
    const { container } = render(<Section className="custom">Content</Section>);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    render(<Section data-testid="section">Content</Section>);
    expect(screen.getByTestId("section")).toBeInTheDocument();
  });
});
