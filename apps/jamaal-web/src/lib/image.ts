/**
 * Sizes for pictures uploaded to DatoCMS, which serves them through imgix.
 * `auto=format,compress` sends AVIF or WebP where the browser takes it, and
 * trims the file; `w` makes the picture no wider than it is shown.
 */
const AUTO = "auto=format,compress";

const base = (url: string) => url.split("?")[0];

/** One width of a picture. */
export function cmsImage(url: string, width: number): string {
  return `${base(url)}?${AUTO}&w=${Math.round(width)}`;
}

/** A `srcset` of the picture at each width, for the browser to choose from. */
export function cmsSrcset(url: string, widths: readonly number[]): string {
  return widths.map((w) => `${cmsImage(url, w)} ${Math.round(w)}w`).join(", ");
}
