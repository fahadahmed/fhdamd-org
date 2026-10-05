import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the legal links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "mailto:hello@jamaal.app",
    );
  });

  it("shows the copyright with the given year", () => {
    render(<Footer year={2026} />);
    expect(screen.getByText("© 2026 · jamaal.app")).toBeInTheDocument();
  });

  it("uses the on-deep wordmark colours on the dark footer ground", () => {
    render(<Footer />);
    const wordmark = screen.getByText("Jamaal").parentElement;
    expect(wordmark).toHaveAttribute("data-tone", "on-deep");
    expect(screen.getByText("Jamaal")).toHaveStyle({ color: "var(--th-on-deep)" });
    expect(screen.getByText("جمال")).toHaveStyle({ color: "var(--th-on-deep-2)" });
  });

  it("defaults to the current year", () => {
    render(<Footer />);
    expect(screen.getByText(`© ${new Date().getFullYear()} · jamaal.app`)).toBeInTheDocument();
  });
});
