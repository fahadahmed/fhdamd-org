import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { LanguageSwitch } from "./LanguageSwitch";

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

describe("LanguageSwitch", () => {
  it("shows the current language code on the trigger button", () => {
    render(<LanguageSwitch languages={languages} />);
    expect(screen.getByRole("button", { name: /en/i })).toBeInTheDocument();
  });

  it("opens the menu on click", () => {
    render(<LanguageSwitch languages={languages} />);
    const trigger = screen.getByRole("button", { name: /en/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("lists every language as a menu item", () => {
    render(<LanguageSwitch languages={languages} />);
    fireEvent.click(screen.getByRole("button", { name: /en/i }));
    expect(screen.getByRole("menuitem", { name: /English/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /العربية/ })).toBeInTheDocument();
  });

  it("calls onLanguageChange and closes the menu when an item is picked", () => {
    const onLanguageChange = vi.fn();
    render(<LanguageSwitch languages={languages} onLanguageChange={onLanguageChange} />);
    fireEvent.click(screen.getByRole("button", { name: /en/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /العربية/ }));
    expect(onLanguageChange).toHaveBeenCalledWith("ar");
    expect(screen.getByRole("button", { name: /ar/i })).toHaveAttribute("aria-expanded", "false");
  });

  it("does not touch document.documentElement's dir/lang attributes", () => {
    const before = { dir: document.documentElement.dir, lang: document.documentElement.lang };
    render(<LanguageSwitch languages={languages} />);
    fireEvent.click(screen.getByRole("button", { name: /en/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /العربية/ }));
    expect(document.documentElement.dir).toBe(before.dir);
    expect(document.documentElement.lang).toBe(before.lang);
  });

  it("respects an initial currentCode", () => {
    render(<LanguageSwitch languages={languages} currentCode="ar" />);
    expect(screen.getByRole("button", { name: /ar/i })).toBeInTheDocument();
  });

  it("closes the menu on outside click", () => {
    render(
      <div>
        <LanguageSwitch languages={languages} />
        <button>outside</button>
      </div>
    );
    fireEvent.click(screen.getByRole("button", { name: /en/i }));
    expect(screen.getByRole("button", { name: /en/i })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByText("outside"));
    expect(screen.getByRole("button", { name: /en/i })).toHaveAttribute("aria-expanded", "false");
  });
});
