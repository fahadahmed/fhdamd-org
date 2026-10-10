import type { ImageMetadata } from "astro";

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/site/*.png", { eager: true });

/**
 * A screenshot from src/assets/site by file name without the extension, for
 * example `screen("g-TD-01")`. Throws at build time if the file is missing, so
 * a typo never ships as a broken image.
 */
export function screen(name: string): ImageMetadata {
  const entry = files[`../assets/site/${name}.png`];
  if (!entry) throw new Error(`No screenshot named "${name}" in src/assets/site`);
  return entry.default;
}
