import { createHash } from "node:crypto";

/** Adds one to a counter and returns the new count; the counter expires on its own. */
export interface CounterStore {
  increment(id: string, expiresAt: Date): Promise<number>;
}

export interface RateLimiter {
  /** True while `key` (an IP address) is under its limit for the current window. */
  allow(key: string): Promise<boolean>;
}

/** A fixed window per client: at most `limit` signups every `windowMs`. The address is stored only as a hash. */
export function createRateLimiter(
  counters: CounterStore,
  { limit = 10, windowMs = 10 * 60_000, now = Date.now }: { limit?: number; windowMs?: number; now?: () => number } = {},
): RateLimiter {
  return {
    async allow(key) {
      const bucket = Math.floor(now() / windowMs);
      const id = createHash("sha256").update(key).digest("hex").slice(0, 32) + `-${bucket}`;
      // Keep the counter for an hour past the window; a TTL policy on expiresAt removes it.
      const expiresAt = new Date((bucket + 1) * windowMs + 3_600_000);
      return (await counters.increment(id, expiresAt)) <= limit;
    },
  };
}
