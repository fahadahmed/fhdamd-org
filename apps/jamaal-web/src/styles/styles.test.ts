import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = resolve(__dirname, "..");

function files(dir: string, ext: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path, ext) : path.endsWith(ext) ? [path] : [];
  });
}

const astroFiles = files(src, ".astro");

describe("styles live in src/styles", () => {
  it("finds the Astro files", () => {
    expect(astroFiles.length).toBeGreaterThan(20);
  });

  it("has no <style> block in any .astro file", () => {
    const offenders = astroFiles.filter((f) => /<style[\s>]/.test(readFileSync(f, "utf8"))).map((f) => relative(src, f));
    expect(offenders).toEqual([]);
  });

  it("sets inline styles only through cssVars (custom properties for data-driven values)", () => {
    const offenders = astroFiles
      .flatMap((f) => [...readFileSync(f, "utf8").matchAll(/\sstyle=("[^"]*"|\{[^}]*\})/g)].map((m) => ({ file: relative(src, f), attr: m[0].trim() })))
      .filter(({ attr }) => !/^style=\{cssVars\(/.test(attr));
    expect(offenders).toEqual([]);
  });

  it("imports every component stylesheet from components.css", () => {
    const index = readFileSync(join(src, "styles/components.css"), "utf8");
    const imported = [...index.matchAll(/@import "\.\/components\/([^"]+)";/g)].map((m) => m[1]).sort();
    const present = readdirSync(join(src, "styles/components")).filter((f) => f.endsWith(".css")).sort();
    expect(imported).toEqual(present);
  });
});
