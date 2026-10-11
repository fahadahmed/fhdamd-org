import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimit";
import type { CounterStore } from "./rateLimit";

const memoryCounters = () => {
  const counts = new Map<string, number>();
  const expiries = new Map<string, Date>();
  const store: CounterStore = {
    async increment(id, expiresAt) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
      expiries.set(id, expiresAt);
      return counts.get(id)!;
    },
  };
  return { store, counts, expiries };
};

describe("createRateLimiter", () => {
  it("allows up to the limit in a window, then refuses", async () => {
    const { store } = memoryCounters();
    const limiter = createRateLimiter(store, { limit: 3, windowMs: 1000, now: () => 5000 });
    expect(await limiter.allow("1.2.3.4")).toBe(true);
    expect(await limiter.allow("1.2.3.4")).toBe(true);
    expect(await limiter.allow("1.2.3.4")).toBe(true);
    expect(await limiter.allow("1.2.3.4")).toBe(false);
  });

  it("counts each address separately", async () => {
    const { store } = memoryCounters();
    const limiter = createRateLimiter(store, { limit: 1, windowMs: 1000, now: () => 0 });
    expect(await limiter.allow("1.1.1.1")).toBe(true);
    expect(await limiter.allow("2.2.2.2")).toBe(true);
    expect(await limiter.allow("1.1.1.1")).toBe(false);
  });

  it("starts a fresh count in the next window", async () => {
    const { store } = memoryCounters();
    let time = 0;
    const limiter = createRateLimiter(store, { limit: 1, windowMs: 1000, now: () => time });
    await limiter.allow("1.1.1.1");
    expect(await limiter.allow("1.1.1.1")).toBe(false);
    time = 1000;
    expect(await limiter.allow("1.1.1.1")).toBe(true);
  });

  it("stores only a hash of the address and sets an expiry an hour after the window", async () => {
    const { store, counts, expiries } = memoryCounters();
    const limiter = createRateLimiter(store, { limit: 5, windowMs: 1000, now: () => 2500 });
    await limiter.allow("203.0.113.9");
    const [id] = [...counts.keys()];
    expect(id).not.toContain("203.0.113.9");
    expect(id).toMatch(/^[0-9a-f]{32}-2$/);
    expect(expiries.get(id)!.getTime()).toBe(3000 + 3_600_000);
  });

  it("has sensible defaults", async () => {
    const { store } = memoryCounters();
    const limiter = createRateLimiter(store);
    expect(await limiter.allow("9.9.9.9")).toBe(true);
  });
});
