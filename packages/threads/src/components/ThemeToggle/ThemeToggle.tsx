"use client";
import { useEffect, useState, type HTMLAttributes } from "react";
import styles from "./ThemeToggle.module.css";

export type Theme = "light" | "dark";

export interface ThemeToggleProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** localStorage key used to persist the choice — defaults to "th-theme" */
  storageKey?: string;
}

/**
 * Self-contained light/dark toggle: reads/writes `data-theme` on <html> and
 * persists the choice to localStorage. Renders "Dark" as a safe SSR default
 * (deterministic, no window access during render) and syncs to the real
 * saved/system preference after mount — the consuming app is responsible for
 * an early blocking script if a pre-hydration flash needs to be avoided.
 */
export function ThemeToggle({ storageKey = "th-theme", className, ...rest }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as Theme | null;
    const initial = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, [storageKey]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(storageKey, next);
  };

  return (
    <button
      type="button"
      className={[styles.button, className].filter(Boolean).join(" ")}
      onClick={toggle}
      {...rest}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
