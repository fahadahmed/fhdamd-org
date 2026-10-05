import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "./Header";

describe("Header", () => {
  it("renders the wordmark with its Arabic name", () => {
    render(<Header />);
    expect(screen.getByText("Jamaal")).toBeInTheDocument();
    expect(screen.getByText("جمال")).toHaveAttribute("lang", "ar");
  });

  it("links the home label to the root", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Jamaal home" })).toHaveAttribute("href", "/");
  });

  it("points the call to action at the signup section by default", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Join the list" })).toHaveAttribute("href", "#join");
  });

  it("accepts a custom call to action", () => {
    render(<Header ctaHref="#download" ctaLabel="Download" />);
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", "#download");
  });
});
