import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "./Header";

describe("Header", () => {
  it("renders the wordmark with the app icon and its Arabic name", () => {
    const { container } = render(<Header launched={false} />);
    expect(screen.getByText("Jamaal")).toBeInTheDocument();
    expect(screen.getByText("جمال")).toHaveAttribute("lang", "ar");
    expect(container.querySelector("img")).toHaveAttribute("src", "/icon-small.svg");
  });

  it("uses the default ink colours in the header", () => {
    render(<Header launched={false} />);
    expect(screen.getByText("Jamaal").closest("[data-tone]")).toHaveAttribute("data-tone", "default");
    expect(screen.getByText("Jamaal")).toHaveStyle({ color: "var(--th-ink)" });
  });

  it("keeps the Arabic name at AA contrast in both themes (ink-2, not ink-3)", () => {
    render(<Header launched={false} />);
    expect(screen.getByText("جمال")).toHaveStyle({ color: "var(--th-ink-2)" });
  });

  it.each([false, true])("links the wordmark to the root, named by its visible text (launched: %s)", (launched) => {
    render(<Header launched={launched} />);
    // Label in Name (WCAG 2.5.3): the accessible name must contain the visible text.
    expect(screen.getByRole("link", { name: /^Jamaal\s*جمال$/ })).toHaveAttribute("href", "/");
  });

  it("before launch: only a Join the list call to action, no nav links", () => {
    render(<Header launched={false} />);
    expect(screen.getByRole("link", { name: "Join the list" })).toHaveAttribute("href", "/#join");
    expect(screen.queryByRole("link", { name: "Pricing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Download" })).not.toBeInTheDocument();
  });

  it("after launch: Pricing and Support links and a Download call to action", () => {
    render(<Header launched />);
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/#pricing");
    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute("href", "/support");
    expect(screen.queryByRole("link", { name: "Journal" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", "/#download");
    expect(screen.queryByRole("link", { name: "Join the list" })).not.toBeInTheDocument();
  });
});
