"use client";
import { useEffect, useState } from "react";
import { SiteNav } from "@fhdamd/threads";
import { BrandWordmark } from "../Brand/Brand";
import { NAV_LINKS } from "../../data/nav";

export interface HeaderProps {
  currentPath: string;
}

export default function Header({ currentPath }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme as "light" | "dark" | undefined;
    setTheme(current ?? "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("th-theme", next);
    setTheme(next);
  };

  const links = NAV_LINKS.map((link) => ({
    ...link,
    active: link.href === "/" ? currentPath === "/" : currentPath.startsWith(link.href),
  }));

  return (
    <SiteNav
      brand={<BrandWordmark />}
      brandLabel="fhdamd home"
      links={links}
      homeHref="/"
      ctas={[{ label: theme === "light" ? "Dark" : "Light", variant: "ghost", onClick: toggleTheme }]}
    />
  );
}
