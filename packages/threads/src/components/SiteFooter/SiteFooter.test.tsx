import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter";

const links = [
  { href: "/tools", label: "Tools" },
  { href: "/privacy", label: "Privacy" },
];

describe("SiteFooter — rendering", () => {
  it("renders a <footer> element", () => {
    const { container } = render(<SiteFooter />);
    expect(container.firstChild?.nodeName).toBe("FOOTER");
  });

  it("renders whatever brand node the consumer supplies", () => {
    render(<SiteFooter brand={<span>Acme</span>} />);
    expect(screen.getAllByText("Acme").length).toBeGreaterThan(0);
  });

  it("renders footer links", () => {
    render(<SiteFooter links={links} />);
    expect(screen.getByRole("link", { name: "Tools" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
  });

  it("renders footer nav landmark when links provided", () => {
    render(<SiteFooter links={links} />);
    expect(screen.getByRole("navigation", { name: "Footer navigation" })).toBeInTheDocument();
  });

  it("does not render nav landmark when no links", () => {
    render(<SiteFooter links={[]} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders no copyright paragraph when none is given", () => {
    render(<SiteFooter />);
    expect(screen.queryByText(/©/)).not.toBeInTheDocument();
  });

  it("renders custom copyright string", () => {
    render(<SiteFooter copyright="© 2026 Custom Corp" />);
    expect(screen.getByText("© 2026 Custom Corp")).toBeInTheDocument();
  });

  it("renders the tagline under the brand in the simple layout", () => {
    render(<SiteFooter brand={<span>Acme</span>} tagline="A considered app by Acme" links={links} />);
    expect(screen.getByText("A considered app by Acme")).toBeInTheDocument();
  });

  it("renders no tagline paragraph when none is given", () => {
    const { container } = render(<SiteFooter brand={<span>Acme</span>} links={links} />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("merges custom className", () => {
    const { container } = render(<SiteFooter className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
