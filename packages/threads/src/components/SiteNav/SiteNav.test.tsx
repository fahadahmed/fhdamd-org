import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteNav } from "./SiteNav";

const defaultLinks = [
  { href: "/tools", label: "Tools" },
  { href: "/pricing", label: "Pricing", active: true },
];

describe("SiteNav — rendering", () => {
  it("renders a <header> element", () => {
    const { container } = render(<SiteNav />);
    expect(container.firstChild?.nodeName).toBe("HEADER");
  });

  it("renders the PDF-Craft wordmark when site=pdf-craft", () => {
    render(<SiteNav site="pdf-craft" />);
    expect(screen.getByRole("link", { name: /PDF-Craft home/ })).toBeInTheDocument();
  });

  it("renders the fhdamd mark (SVG) when site=fhdamd", () => {
    const { container } = render(<SiteNav site="fhdamd" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders nav links", () => {
    render(<SiteNav links={defaultLinks} />);
    expect(screen.getByRole("link", { name: "Tools" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toBeInTheDocument();
  });

  it("marks the active link with aria-current=page", () => {
    render(<SiteNav links={defaultLinks} />);
    // aria-current appears on both desktop and mobile nav links
    const activeLinks = screen.getAllByRole("link", { name: "Pricing" });
    expect(activeLinks.some((l) => l.getAttribute("aria-current") === "page")).toBe(true);
  });

  it("renders CTAs when provided", () => {
    render(<SiteNav ctas={[{ href: "/signin", label: "Log in" }, { href: "/signup", label: "Sign up" }]} />);
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });

  it("renders home link with correct href", () => {
    render(<SiteNav homeHref="/home" />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/home");
  });

  it("renders burger button", () => {
    render(<SiteNav />);
    // Burger is CSS-hidden on wide viewports but present in DOM
    expect(screen.getByTestId("burger")).toBeInTheDocument();
  });
});

describe("SiteNav — mobile menu", () => {
  it("burger button has aria-expanded=false initially", () => {
    render(<SiteNav links={defaultLinks} />);
    expect(screen.getByTestId("burger")).toHaveAttribute("aria-expanded", "false");
  });

  it("opens mobile menu — aria-expanded becomes true", async () => {
    const user = userEvent.setup();
    render(<SiteNav links={defaultLinks} />);
    await user.click(screen.getByTestId("burger"));
    expect(screen.getByTestId("burger")).toHaveAttribute("aria-expanded", "true");
  });

  it("closes mobile menu on second burger click", async () => {
    const user = userEvent.setup();
    render(<SiteNav links={defaultLinks} />);
    await user.click(screen.getByTestId("burger"));
    await user.click(screen.getByTestId("burger"));
    expect(screen.getByTestId("burger")).toHaveAttribute("aria-expanded", "false");
  });

  it("closes mobile menu on Escape key", async () => {
    const user = userEvent.setup();
    render(<SiteNav links={defaultLinks} />);
    await user.click(screen.getByTestId("burger"));
    expect(screen.getByTestId("burger")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(screen.getByTestId("burger")).toHaveAttribute("aria-expanded", "false");
  });

  it("burger label toggles between open and close", async () => {
    const user = userEvent.setup();
    render(<SiteNav links={defaultLinks} />);
    expect(screen.getByTestId("burger")).toHaveAttribute("aria-label", "Open menu");
    await user.click(screen.getByTestId("burger"));
    expect(screen.getByTestId("burger")).toHaveAttribute("aria-label", "Close menu");
  });
});

describe("SiteNav — accessibility", () => {
  it("has a main navigation landmark when links provided", () => {
    render(<SiteNav links={defaultLinks} />);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" })
    ).toBeInTheDocument();
  });

  it("burger button references mobile nav via aria-controls", () => {
    render(<SiteNav />);
    expect(screen.getByTestId("burger")).toHaveAttribute(
      "aria-controls",
      "site-mobile-nav"
    );
  });

  it("home link has descriptive aria-label", () => {
    render(<SiteNav site="pdf-craft" />);
    expect(screen.getByRole("link", { name: "PDF-Craft home" })).toBeInTheDocument();
  });
});
