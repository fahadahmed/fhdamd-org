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

  it("defaults to the current year", () => {
    render(<Footer />);
    expect(screen.getByText(`© ${new Date().getFullYear()} · jamaal.app`)).toBeInTheDocument();
  });
});
