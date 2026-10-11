import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { STAGES } from "../../scripts/stage-parse.mjs";
import { FEATURES } from "../data/site";
import { NAV_CTA, footerLinks, navLinks } from "./nav";

const pages = resolve(__dirname, "../pages");
const off = { journal: false, pressKit: false };
const on = { journal: true, pressKit: true };

describe("navLinks", () => {
  it("lists the home sections", () => {
    expect(navLinks(off).map((l) => l.label)).toEqual(["A day", "Everywhere", "Pricing", "FAQ"]);
  });

  it("adds the Journal only once it exists", () => {
    expect(navLinks(on).at(-1)).toEqual({ href: "/journal", label: "Journal" });
  });

  it("uses /#id so section links work from any page", () => {
    for (const link of navLinks(on).filter((l) => l.label !== "Journal")) {
      expect(link.href).toMatch(/^\/#/);
    }
  });
});

describe("NAV_CTA", () => {
  it("has a label for every stage, all pointing at the join section", () => {
    expect(Object.keys(NAV_CTA).sort()).toEqual([...STAGES].sort());
    expect(NAV_CTA.waitlist.label).toBe("Join the waitlist");
    expect(NAV_CTA.testflight.label).toBe("Join the beta");
    expect(NAV_CTA.launched.label).toBe("Get Jamaal");
    for (const cta of Object.values(NAV_CTA)) expect(cta.href).toBe("/#join");
  });
});

describe("footerLinks", () => {
  it("leaves out Journal and Press kit until they exist", () => {
    const labels = footerLinks(off, "hi@example.com").map((l) => l.label);
    expect(labels).not.toContain("Journal");
    expect(labels).not.toContain("Press kit");
    expect(labels).toEqual(["Privacy", "Terms", "Support", "Contact", "fhdamd.dev"]);
  });

  it("includes them when switched on", () => {
    const labels = footerLinks(on, "hi@example.com").map((l) => l.label);
    expect(labels[0]).toBe("Journal");
    expect(labels).toContain("Press kit");
  });

  it("builds the contact mailto from the address", () => {
    expect(footerLinks(off, "hi@example.com").find((l) => l.label === "Contact")?.href).toBe("mailto:hi@example.com");
  });
});

/** Every internal link that ships today must have a page behind it. */
describe("shipped links", () => {
  it("all point at pages that exist", () => {
    const hrefs = [...navLinks(FEATURES), ...footerLinks(FEATURES, "x@y.z")]
      .map((l) => l.href)
      .filter((href) => href.startsWith("/") && !href.startsWith("/#"));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const page = href.slice(1);
      const exists = existsSync(resolve(pages, `${page}.astro`)) || existsSync(resolve(pages, page, "index.astro"));
      expect(exists, `no page for ${href}`).toBe(true);
    }
  });
});
