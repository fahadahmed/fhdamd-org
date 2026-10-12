import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { STAGES } from "../../scripts/stage-parse.mjs";
import { brand, facts, files, statusLine } from "./press";

describe("press kit", () => {
  it("has a status line for every stage", () => {
    for (const stage of STAGES) expect(statusLine(stage).length).toBeGreaterThan(20);
    expect(statusLine("launched")).toContain("App Store");
    expect(statusLine("testflight")).toContain("TestFlight");
  });

  it("lists only files that exist in public/press, each with real alt text", () => {
    for (const f of files) {
      expect(existsSync(resolve(__dirname, "../../public/press", f.file)), f.file).toBe(true);
      expect(f.alt.length).toBeGreaterThan(15);
    }
  });

  it("has no duplicate files", () => {
    expect(new Set(files.map((f) => f.file)).size).toBe(files.length);
  });

  it("states the price and the privacy position the Terms and Privacy pages do", () => {
    const text = facts.map((f) => f.value).join(" ");
    expect(text).toContain("$2.99");
    expect(text).toContain("$24.99");
    expect(text).toContain("No account");
  });

  it("gives every brand colour a hex value", () => {
    for (const c of brand.colours) expect(c.hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});
