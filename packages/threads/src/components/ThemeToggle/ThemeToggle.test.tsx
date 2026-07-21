import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    mockMatchMedia(false);
  });

  it("defaults to light / shows 'Dark' as the action label", async () => {
    render(<ThemeToggle />);
    expect(await screen.findByRole("button", { name: "Dark" })).toBeInTheDocument();
  });

  it("picks up system dark preference on mount when nothing is saved", async () => {
    mockMatchMedia(true);
    render(<ThemeToggle />);
    expect(await screen.findByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("picks up a saved preference over system preference", async () => {
    window.localStorage.setItem("th-theme", "dark");
    mockMatchMedia(false);
    render(<ThemeToggle />);
    expect(await screen.findByRole("button", { name: "Light" })).toBeInTheDocument();
  });

  it("toggles theme on click and persists to localStorage", async () => {
    render(<ThemeToggle />);
    const button = await screen.findByRole("button", { name: "Dark" });
    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem("th-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
  });

  it("respects a custom storageKey", async () => {
    render(<ThemeToggle storageKey="custom-theme-key" />);
    const button = await screen.findByRole("button", { name: "Dark" });
    fireEvent.click(button);
    expect(window.localStorage.getItem("custom-theme-key")).toBe("dark");
  });

  it("merges custom className", async () => {
    render(<ThemeToggle className="custom" />);
    const button = await screen.findByRole("button", { name: "Dark" });
    expect(button).toHaveClass("custom");
  });
});
