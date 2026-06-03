import { render, screen } from "@testing-library/react";
import { EssayRow } from "./EssayRow";

describe("EssayRow — rendering", () => {
  it("renders the date", () => {
    render(<EssayRow date="May 2026" title="Why Jamaal has no subscription" />);
    expect(screen.getByText("May 2026")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<EssayRow date="May 2026" title="Why Jamaal has no subscription" />);
    expect(screen.getByText("Why Jamaal has no subscription")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <EssayRow
        date="May 2026"
        title="Why Jamaal has no subscription"
        subtitle="On pricing honestly"
      />
    );
    expect(screen.getByText("On pricing honestly")).toBeInTheDocument();
  });

  it("does not render subtitle when omitted", () => {
    render(<EssayRow date="May 2026" title="Title" />);
    expect(screen.queryByText("On pricing honestly")).not.toBeInTheDocument();
  });

  it.each(["design", "product", "dev"] as const)(
    "renders category chip for %s",
    (category) => {
      render(<EssayRow date="May 2026" title="Title" category={category} />);
      const label = { design: "Design", product: "Product", dev: "Dev" }[category];
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  );

  it("renders no category chip when omitted", () => {
    render(<EssayRow date="May 2026" title="Title" />);
    expect(screen.queryByText("Design")).not.toBeInTheDocument();
    expect(screen.queryByText("Product")).not.toBeInTheDocument();
    expect(screen.queryByText("Dev")).not.toBeInTheDocument();
  });

  it("renders the arrow indicator", () => {
    render(<EssayRow date="May 2026" title="Title" />);
    expect(screen.getByText("→")).toBeInTheDocument();
  });
});

describe("EssayRow — element type", () => {
  it("renders as <a>", () => {
    const { container } = render(<EssayRow date="May 2026" title="Title" />);
    expect(container.firstChild?.nodeName).toBe("A");
  });

  it("has correct href", () => {
    render(<EssayRow date="May 2026" title="Title" href="/post/1" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/post/1");
  });

  it("defaults href to #", () => {
    render(<EssayRow date="May 2026" title="Title" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#");
  });
});

describe("EssayRow — accessibility", () => {
  it("arrow is hidden from screen readers", () => {
    render(<EssayRow date="May 2026" title="Title" />);
    const arrow = screen.getByText("→");
    expect(arrow).toHaveAttribute("aria-hidden", "true");
  });

  it("is keyboard focusable", async () => {
    const { user } = { user: (await import("@testing-library/user-event")).default.setup() };
    render(<EssayRow date="May 2026" title="Title" />);
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
  });
});
