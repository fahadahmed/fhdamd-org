import type { ImageMetadata } from "astro";

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/{site,journal}/*.png", { eager: true });

/**
 * A screenshot by file name without the extension: `screen("g-TD-01")` for
 * src/assets/site, `screen("journal/TD-01-salah")` for src/assets/journal.
 * Throws at build time if the file is missing, so a typo never ships as a
 * broken image.
 */
export function screen(name: string): ImageMetadata {
  const folder = name.startsWith("journal/") ? "journal" : "site";
  const file = name.replace(/^journal\//, "");
  const entry = files[`../assets/${folder}/${file}.png`];
  if (!entry) throw new Error(`No screenshot named "${name}" in src/assets/${folder}`);
  return entry.default;
}
