import { render, screen } from "@testing-library/react";
import { OpCard } from "./OpCard";

const Icon = () => <svg data-testid="op-icon" aria-hidden="true" />;

const baseProps = {
  name: "Merge PDFs",
  description: "Combine multiple PDF documents into a single file.",
  credits: 2,
  icon: <Icon />,
};

describe("OpCard — live", () => {
  const liveProps = { ...baseProps, status: "live" as const, href: "/merge" };

  it("renders name and description", () => {
    render(<OpCard {...liveProps} />);
    // name appears in both the heading and the CTA span — use getAllByText
    expect(screen.getAllByText("Merge PDFs").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Combine multiple PDF documents into a single file.")
    ).toBeInTheDocument();
  });

  it("renders as <a> with correct href", () => {
    render(<OpCard {...liveProps} />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/merge");
  });

  it("has an accessible aria-label on the link", () => {
    render(<OpCard {...liveProps} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "aria-label",
      "Merge PDFs — 2 credits"
    );
  });

  it('shows "credits" label (plural) when credits > 1', () => {
    render(<OpCard {...liveProps} credits={4} />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("credits")).toBeInTheDocument();
  });

  it('shows "credit" label (singular) when credits = 1', () => {
    render(<OpCard {...liveProps} credits={1} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("credit")).toBeInTheDocument();
  });

  it("does not render the coming soon pill", () => {
    render(<OpCard {...liveProps} />);
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });

  it("uses name as default CTA label", () => {
    render(<OpCard {...liveProps} />);
    // name appears in both the heading and the CTA — 2 matches expected
    expect(screen.getAllByText("Merge PDFs")).toHaveLength(2);
  });

  it("uses ctaLabel when provided", () => {
    render(<OpCard {...liveProps} ctaLabel="Merge now" />);
    expect(screen.getByText(/Merge now/)).toBeInTheDocument();
  });

  it("icon wrapper is hidden from accessibility tree", () => {
    render(<OpCard {...liveProps} />);
    const iconWrapper = screen.getByTestId("op-icon").parentElement!;
    expect(iconWrapper).toHaveAttribute("aria-hidden", "true");
  });
});

describe("OpCard — coming soon", () => {
  const soonProps = { ...baseProps, status: "soon" as const };

  it("renders name and description", () => {
    render(<OpCard {...soonProps} />);
    expect(screen.getByText("Merge PDFs")).toBeInTheDocument();
    expect(
      screen.getByText("Combine multiple PDF documents into a single file.")
    ).toBeInTheDocument();
  });

  it("renders as <div>, not <a>", () => {
    render(<OpCard {...soonProps} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the coming soon pill", () => {
    render(<OpCard {...soonProps} />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("does not render the credits display", () => {
    render(<OpCard {...soonProps} />);
    expect(screen.queryByText("credits")).not.toBeInTheDocument();
    expect(screen.queryByText("credit")).not.toBeInTheDocument();
  });

  it("has accessible aria-label indicating coming soon state", () => {
    const { container } = render(<OpCard {...soonProps} />);
    expect(container.firstChild).toHaveAttribute(
      "aria-label",
      "Merge PDFs — coming soon"
    );
  });
});

describe("OpCard — icon variants", () => {
  it.each(["terra", "sage", "muted"] as const)(
    "renders iconVariant=%s without throwing",
    (iconVariant) => {
      expect(() =>
        render(
          <OpCard
            {...baseProps}
            iconVariant={iconVariant}
            status="live"
            href="/op"
          />
        )
      ).not.toThrow();
    }
  );
});
