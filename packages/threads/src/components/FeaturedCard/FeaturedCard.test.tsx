import { render, screen } from "@testing-library/react";
import { FeaturedCard } from "./FeaturedCard";

describe("FeaturedCard", () => {
  it("renders the Featured badge and eyebrow meta text", () => {
    render(
      <FeaturedCard eyebrowMeta="July 2026 · 9 min read" title="A post" description="d" href="#" />
    );
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText(/July 2026/)).toBeInTheDocument();
  });

  it("renders title and description", () => {
    render(<FeaturedCard eyebrowMeta="e" title="A featured post" description="A description" href="#" />);
    expect(screen.getByText("A featured post")).toBeInTheDocument();
    expect(screen.getByText("A description")).toBeInTheDocument();
  });

  it("renders as a link to the given href", () => {
    render(<FeaturedCard eyebrowMeta="e" title="t" description="d" href="/blog/featured-post" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/blog/featured-post");
  });

  it("renders meta badges when provided", () => {
    render(
      <FeaturedCard eyebrowMeta="e" title="t" description="d" href="#" metaBadges={[{ label: "Dev" }, { label: "Architecture" }]} />
    );
    expect(screen.getByText("Dev")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<FeaturedCard eyebrowMeta="e" title="t" description="d" href="#" className="custom" data-testid="fc" />);
    expect(screen.getByTestId("fc")).toHaveClass("custom");
  });
});
