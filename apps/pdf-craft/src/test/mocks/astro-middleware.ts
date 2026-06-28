// Astro's real defineMiddleware is an identity function: src/core/middleware/index.js
export function defineMiddleware<T>(fn: T): T {
  return fn;
}
