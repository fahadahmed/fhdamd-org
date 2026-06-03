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

  it("renders PDF-Craft wordmark when site=pdf-craft", () => {
    render(<SiteFooter site="pdf-craft" />);
    // getAllByText because parent <a> and child <span> both contain the text
    expect(screen.getAllByText(/PDF-Craft/).length).toBeGreaterThan(0);
  });

  it("renders fhdamd wordmark when site=fhdamd", () => {
    render(<SiteFooter site="fhdamd" />);
    expect(screen.getAllByText(/fhdamd/).length).toBeGreaterThan(0);
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

  it("renders default copyright with current year and site name", () => {
    render(<SiteFooter site="pdf-craft" />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`${year}.*PDF-Craft`))).toBeInTheDocument();
  });

  it("renders custom copyright string", () => {
    render(<SiteFooter copyright="© 2026 Custom Corp" />);
    expect(screen.getByText("© 2026 Custom Corp")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<SiteFooter className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
