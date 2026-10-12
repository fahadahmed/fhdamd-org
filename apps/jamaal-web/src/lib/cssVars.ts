/**
 * The only way an Astro file sets an inline style: CSS custom properties for a
 * value that comes from data (a position, a colour, a size). The rules that
 * read them live in src/styles. `cssVars({ w: "300px" })` is `--w: 300px`.
 */
export function cssVars(vars: Record<string, string | number | false | null | undefined>): string | undefined {
  const declarations = Object.entries(vars)
    .filter((entry): entry is [string, string | number] => entry[1] !== false && entry[1] !== null && entry[1] !== undefined && entry[1] !== "")
    .map(([name, value]) => `--${name}: ${value}`);
  return declarations.length ? declarations.join("; ") : undefined;
}
