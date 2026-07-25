import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";

describe("Header", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
  });

  it("marks the nav link matching the current path as active", () => {
    render(<Header currentPath="/services" />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("only marks Work active on the home path itself, not every path", () => {
    render(<Header currentPath="/about" />);
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("reads the theme already applied to the document on mount", () => {
    document.documentElement.dataset.theme = "dark";
    render(<Header currentPath="/" />);
    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
  });

  it("toggles the theme, updating the document and localStorage", async () => {
    const user = userEvent.setup();
    render(<Header currentPath="/" />);

    const toggle = screen.getByRole("button", { name: "Dark" });
    await user.click(toggle);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("th-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
  });
});
