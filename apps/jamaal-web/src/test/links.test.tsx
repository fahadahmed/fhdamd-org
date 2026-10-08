import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

const pages = resolve(__dirname, "../pages");

/**
 * Every internal link in the header and footer must have a page behind it.
 * Section links use "/#id" so they work from any page, not just the home page.
 */
describe.each([false, true])("internal links (launched: %s)", (launched) => {
  it("all point at pages that exist", () => {
    render(
      <>
        <Header launched={launched} />
        <Footer launched={launched} />
      </>,
    );
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("/") && !href.startsWith("/#"));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const page = href === "/" ? "index" : href.slice(1);
      expect(existsSync(resolve(pages, `${page}.astro`)), `no page for ${href}`).toBe(true);
    }
  });
});
