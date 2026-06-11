import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the tagline", () => {
    render(<Footer />);
    expect(screen.getByText("Simple tools. Honest pricing.")).toBeInTheDocument();
  });

  it("renders Tools column with all links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Merge PDFs" })).toHaveAttribute("href", "/mergepdf");
    expect(screen.getByRole("link", { name: "Image to PDF" })).toHaveAttribute("href", "/imagetopdf");
    expect(screen.getByRole("link", { name: "Protect PDF" })).toHaveAttribute("href", "/encryptpdf");
    expect(screen.getByRole("link", { name: "Unlock PDF" })).toHaveAttribute("href", "/decryptpdf");
  });

  it("renders Account column with all links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("link", { name: "Buy credits" })).toHaveAttribute("href", "/#pricing");
  });

  it("renders Legal column with all links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms & Conditions" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("renders the bottom-right attribution text", () => {
    render(<Footer />);
    expect(screen.getByText("Built on the Threads design system")).toBeInTheDocument();
  });

  it("renders all three column headings", () => {
    render(<Footer />);
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });
});
