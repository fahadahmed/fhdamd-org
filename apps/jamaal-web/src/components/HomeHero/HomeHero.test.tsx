import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomeHero from "./HomeHero";

describe("HomeHero", () => {
  it("renders the heading and the italic second line", () => {
    render(<HomeHero />);
    expect(screen.getByRole("heading", { level: 1, name: "One list. Just today." })).toBeInTheDocument();
    expect(screen.getByText("Beautifully ordered.").tagName).toBe("EM");
  });

  it("links the call to action to the signup section by default", () => {
    render(<HomeHero />);
    expect(screen.getByRole("link", { name: "Join the list" })).toHaveAttribute("href", "#join");
  });

  it("accepts a custom call to action", () => {
    render(<HomeHero ctaHref="#download" ctaLabel="Download" />);
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", "#download");
  });
});
