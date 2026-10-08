import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "./Footer";

const names = () => screen.getAllByRole("link").map((link) => link.textContent);

describe("Footer", () => {
  it("shows the company tagline", () => {
    render(<Footer launched={false} />);
    expect(screen.getByText("A considered app by fhdamd")).toBeInTheDocument();
  });

  it("before launch: only Privacy and Contact", () => {
    render(<Footer launched={false} />);
    expect(names()).toEqual(["Privacy", "Contact"]);
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "mailto:hello@fhdamd.dev");
  });

  it("after launch: the full set of legal and support links, in order", () => {
    render(<Footer launched />);
    expect(names()).toEqual(["Support", "Privacy", "Terms", "Contact"]);
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
  });

  it("uses the on-deep wordmark colours on the dark footer ground", () => {
    render(<Footer launched={false} />);
    expect(screen.getByText("Jamaal").closest("[data-tone]")).toHaveAttribute("data-tone", "on-deep");
    expect(screen.getByText("Jamaal")).toHaveStyle({ color: "var(--th-on-deep)" });
    expect(screen.getByText("جمال")).toHaveStyle({ color: "var(--th-on-deep-2)" });
  });
});
