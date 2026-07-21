import { render, screen } from "@testing-library/react";
import { ContentCard } from "./ContentCard";

describe("ContentCard", () => {
  it("renders title, description, and date", () => {
    render(<ContentCard title="A post" description="A description" date="May 2026" href="#" />);
    expect(screen.getByText("A post")).toBeInTheDocument();
    expect(screen.getByText("A description")).toBeInTheDocument();
    expect(screen.getByText("May 2026")).toBeInTheDocument();
  });

  it("renders badges", () => {
    render(<ContentCard title="A post" date="May 2026" href="#" badges={[{ label: "Product" }]} />);
    expect(screen.getByText("Product")).toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    render(<ContentCard title="A post" date="May 2026" href="/blog/a-post" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/blog/a-post");
  });

  it("renders as a non-link element when comingSoon is true, even with href", () => {
    render(<ContentCard title="Next post" date="Coming soon" href="/should-not-link" comingSoon />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not render the arrow affordance when comingSoon is true", () => {
    const { container: comingSoon } = render(
      <ContentCard title="Next post" date="Coming soon" comingSoon />
    );
    const { container: normal } = render(
      <ContentCard title="A post" date="May 2026" href="#" />
    );
    expect(comingSoon.querySelector("svg")).not.toBeInTheDocument();
    expect(normal.querySelector("svg")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<ContentCard title="A post" date="May 2026" href="#" className="custom" data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveClass("custom");
  });
});
