import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the copyright text passed in as a prop", () => {
    render(<Footer copyright="© 2026 fhdamd.dev" />);
    expect(screen.getByText("© 2026 fhdamd.dev")).toBeInTheDocument();
  });

  it("renders the site nav links", () => {
    render(<Footer copyright="© 2026 fhdamd.dev" />);
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("renders the fhdamd wordmark as the brand", () => {
    render(<Footer copyright="© 2026 fhdamd.dev" />);
    expect(screen.getByText("fhdamd")).toBeInTheDocument();
  });
});
