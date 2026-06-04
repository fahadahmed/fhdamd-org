import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

describe("Text — element type", () => {
  it("renders as <p> by default", () => {
    const { container } = render(<Text>Hello</Text>);
    expect(container.firstChild?.nodeName).toBe("P");
  });

  it.each(["span", "div", "h1", "h2", "h3", "strong"] as const)(
    "renders as <%s> when as=%s",
    (tag) => {
      const { container } = render(<Text as={tag}>Hello</Text>);
      expect(container.firstChild?.nodeName).toBe(tag.toUpperCase());
    }
  );
});

describe("Text — rendering", () => {
  it("renders children", () => {
    render(<Text>The quick brown fox</Text>);
    expect(screen.getByText("The quick brown fox")).toBeInTheDocument();
  });

  it("renders rich children", () => {
    render(<Text>Hello <em>world</em></Text>);
    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<Text className="custom">Text</Text>);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("applies fontVariationSettings when weight/width provided", () => {
    const { container } = render(
      <Text family="display" weight={650} width={92}>Text</Text>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.fontVariationSettings).toContain('"wdth" 92');
    expect(el.style.fontVariationSettings).toContain('"wght" 650');
  });

  it("does not apply fontVariationSettings for non-display families", () => {
    const { container } = render(
      <Text family="serif" weight={300}>Text</Text>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.fontVariationSettings).toBe("");
  });

  it.each(["xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const)(
    "renders size=%s without throwing",
    (size) => {
      expect(() => render(<Text size={size}>Text</Text>)).not.toThrow();
    }
  );

  it.each(["display", "serif", "mono"] as const)(
    "renders family=%s without throwing",
    (family) => {
      expect(() => render(<Text family={family}>Text</Text>)).not.toThrow();
    }
  );

  it("forwards additional HTML attributes", () => {
    render(<Text data-testid="text-el">Text</Text>);
    expect(screen.getByTestId("text-el")).toBeInTheDocument();
  });
});
