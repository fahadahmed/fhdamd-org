import { render, screen } from "@testing-library/react";
import { PriceCard } from "./PriceCard";

const ops = [
  { label: "Merge PDFs",      tag: "5 merges"   },
  { label: "Image to PDF",    tag: "5 converts" },
  { label: "Protect / Unlock", tag: "2 ops"     },
];

const defaultProps = {
  credits: 10,
  price:   "$2.99",
  cta:     { href: "/signup", label: "Get started" },
};

describe("PriceCard — rendering", () => {
  it("renders credits", () => {
    render(<PriceCard {...defaultProps} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("cr")).toBeInTheDocument();
  });

  it("renders price", () => {
    render(<PriceCard {...defaultProps} />);
    expect(screen.getByText("$2.99")).toBeInTheDocument();
  });

  it("renders priceNote when provided", () => {
    render(<PriceCard {...defaultProps} priceNote="$0.30 per credit" />);
    expect(screen.getByText("$0.30 per credit")).toBeInTheDocument();
  });

  it("does not render priceNote when omitted", () => {
    render(<PriceCard {...defaultProps} />);
    expect(screen.queryByText("$0.30 per credit")).not.toBeInTheDocument();
  });

  it("renders operations list", () => {
    render(<PriceCard {...defaultProps} operations={ops} />);
    expect(screen.getByText("Merge PDFs")).toBeInTheDocument();
    expect(screen.getByText("5 merges")).toBeInTheDocument();
    expect(screen.getByText("Image to PDF")).toBeInTheDocument();
  });

  it("renders no operations when list is empty", () => {
    render(<PriceCard {...defaultProps} operations={[]} />);
    expect(screen.queryByText("Merge PDFs")).not.toBeInTheDocument();
  });

  it("renders CTA link with correct href", () => {
    render(<PriceCard {...defaultProps} />);
    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute("href", "/signup");
  });

  it("merges custom className", () => {
    const { container } = render(<PriceCard {...defaultProps} className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("PriceCard — featured variant", () => {
  it("renders featured badge when featured=true", () => {
    render(<PriceCard {...defaultProps} featured />);
    expect(screen.getByText("Most popular")).toBeInTheDocument();
  });

  it("renders custom featuredLabel", () => {
    render(<PriceCard {...defaultProps} featured featuredLabel="Best value" />);
    expect(screen.getByText("Best value")).toBeInTheDocument();
  });

  it("does not render badge when featured=false", () => {
    render(<PriceCard {...defaultProps} />);
    expect(screen.queryByText("Most popular")).not.toBeInTheDocument();
  });
});
