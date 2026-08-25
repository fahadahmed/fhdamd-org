/** Derived from body word count rather than stored, so it can't drift out of sync as a post is edited. */
export function computeReadTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
