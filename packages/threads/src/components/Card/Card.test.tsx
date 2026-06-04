import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card, CardTitle, CardBody } from "./Card";

describe("Card", () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders as <div> by default", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders as <article> when as='article'", () => {
    const { container } = render(<Card as="article">Content</Card>);
    expect(container.firstChild?.nodeName).toBe("ARTICLE");
  });

  it("renders as <section> when as='section'", () => {
    const { container } = render(<Card as="section">Content</Card>);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  // ── Variants ─────────────────────────────────────────────────────────────

  it.each(["default", "elevated", "inverse"] as const)(
    "renders variant=%s without throwing",
    (variant) => {
      expect(() => render(<Card variant={variant}>Content</Card>)).not.toThrow();
    }
  );

  // ── Interactive variant ───────────────────────────────────────────────────

  it("has role=button and tabIndex=0 when interactive", () => {
    render(<Card variant="interactive">Content</Card>);
    const card = screen.getByRole("button");
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("tabindex", "0");
  });

  it("is keyboard accessible when interactive", async () => {
    const user = userEvent.setup();
    render(<Card variant="interactive">Content</Card>);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
  });

  it("does not have role=button for non-interactive variants", () => {
    render(<Card variant="default">Content</Card>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // ── Accent bars ───────────────────────────────────────────────────────────

  it("applies terra accent CSS variable when accentBar=top and accentColor=terra", () => {
    const { container } = render(
      <Card accentBar="top" accentColor="terra">
        Content
      </Card>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--card-accent")).toBe("var(--th-color-accent)");
  });

  it("applies sage accent CSS variable when accentBar=top and accentColor=sage", () => {
    const { container } = render(
      <Card accentBar="top" accentColor="sage">
        Content
      </Card>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--card-accent")).toBe("var(--th-color-sage)");
  });

  it("does not apply accent CSS variable when accentBar=none", () => {
    const { container } = render(<Card accentBar="none">Content</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--card-accent")).toBe("");
  });

  // ── Custom className ──────────────────────────────────────────────────────

  it("merges custom className", () => {
    const { container } = render(
      <Card className="my-card">Content</Card>
    );
    expect(container.firstChild).toHaveClass("my-card");
  });
});

describe("CardTitle", () => {
  it("renders children", () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<CardTitle className="custom-title">Title</CardTitle>);
    expect(screen.getByText("Title")).toHaveClass("custom-title");
  });

  it("forwards additional HTML attributes", () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId("title")).toBeInTheDocument();
  });
});

describe("CardBody", () => {
  it("renders children", () => {
    render(<CardBody>Body text</CardBody>);
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<CardBody className="custom-body">Body</CardBody>);
    expect(screen.getByText("Body")).toHaveClass("custom-body");
  });

  it("renders rich children", () => {
    render(
      <CardBody>
        <span data-testid="inner">Rich content</span>
      </CardBody>
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });
});
