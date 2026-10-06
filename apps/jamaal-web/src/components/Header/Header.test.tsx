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

  it("links the home label to the root", () => {
    render(<Header launched={false} />);
    expect(screen.getByRole("link", { name: "Jamaal home" })).toHaveAttribute("href", "/");
  });

  it("before launch: only a Join the list call to action, no nav links", () => {
    render(<Header launched={false} />);
    expect(screen.getByRole("link", { name: "Join the list" })).toHaveAttribute("href", "#join");
    expect(screen.queryByRole("link", { name: "Pricing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Download" })).not.toBeInTheDocument();
  });

  it("after launch: Pricing, Support and Journal links and a Download call to action", () => {
    render(<Header launched />);
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "#pricing");
    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute("href", "/support");
    expect(screen.getByRole("link", { name: "Journal" })).toHaveAttribute("href", "/journal");
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", "#download");
    expect(screen.queryByRole("link", { name: "Join the list" })).not.toBeInTheDocument();
  });
});
