import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders as <button> by default", () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.firstChild?.nodeName).toBe("BUTTON");
  });

  it('has type="button" by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("renders as <a> when href is provided", () => {
    render(<Button href="/merge">Merge PDFs</Button>);
    const link = screen.getByRole("link", { name: "Merge PDFs" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/merge");
  });

  it("does not have a role=button when rendered as <a>", () => {
    render(<Button href="/merge">Merge PDFs</Button>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // ── Variants & sizes ─────────────────────────────────────────────────────

  it.each([
    "solid-ink",
    "solid-terra",
    "solid-sage",
    "ghost",
    "ghost-inverse",
    "outline",
    "subtle-terra",
    "subtle-sage",
    "destructive",
  ] as const)("renders variant=%s without throwing", (variant) => {
    expect(() => render(<Button variant={variant}>Label</Button>)).not.toThrow();
  });

  it("defaults to the solid-terra variant", () => {
    const { container } = render(<Button>Label</Button>);
    const terra = render(<Button variant="solid-terra">Label</Button>).container;
    expect(container.firstElementChild?.className).toBe(terra.firstElementChild?.className);
  });

  it.each(["solid-ink", "solid-sage"] as const)(
    "renders deprecated variant=%s as ghost and warns once",
    async (variant) => {
      vi.resetModules();
      const { Button: FreshButton } = await import("./Button");
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const ghost = render(<FreshButton variant="ghost">Label</FreshButton>).container;
      const { container, rerender } = render(<FreshButton variant={variant}>Label</FreshButton>);
      expect(container.firstElementChild?.className).toBe(ghost.firstElementChild?.className);
      rerender(<FreshButton variant={variant}>Again</FreshButton>);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain(variant);
      warn.mockRestore();
    }
  );

  it.each(["sm", "md", "lg"] as const)(
    "renders size=%s without throwing",
    (size) => {
      expect(() => render(<Button size={size}>Label</Button>)).not.toThrow();
    }
  );

  // ── Interactions ─────────────────────────────────────────────────────────

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click me
      </Button>
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is keyboard accessible — reachable via Tab", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
  });

  it("activates via Enter key", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("activates via Space key", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    screen.getByRole("button").focus();
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── Icon ─────────────────────────────────────────────────────────────────

  it("renders icon with aria-hidden wrapper", () => {
    const icon = <svg data-testid="test-icon" />;
    render(<Button icon={icon}>Label</Button>);
    const wrapper = screen.getByTestId("test-icon").parentElement!;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("renders icon before label when iconPosition=start", () => {
    const icon = <svg data-testid="test-icon" />;
    render(
      <Button icon={icon} iconPosition="start">
        Label
      </Button>
    );
    const button = screen.getByRole("button");
    const children = Array.from(button.childNodes);
    const iconIndex = children.findIndex((n) =>
      (n as Element).querySelector?.("[data-testid='test-icon']")
    );
    const labelIndex = children.findIndex(
      (n) => n.textContent === "Label"
    );
    expect(iconIndex).toBeLessThan(labelIndex);
  });

  it("renders icon after label when iconPosition=end (default)", () => {
    const icon = <svg data-testid="test-icon" />;
    render(<Button icon={icon}>Label</Button>);
    const button = screen.getByRole("button");
    const children = Array.from(button.childNodes);
    const iconIndex = children.findIndex((n) =>
      (n as Element).querySelector?.("[data-testid='test-icon']")
    );
    const labelIndex = children.findIndex(
      (n) => n.textContent === "Label"
    );
    expect(iconIndex).toBeGreaterThan(labelIndex);
  });

  // ── Custom className ──────────────────────────────────────────────────────

  it("merges custom className", () => {
    render(<Button className="my-custom-class">Label</Button>);
    expect(screen.getByRole("button")).toHaveClass("my-custom-class");
  });
});
