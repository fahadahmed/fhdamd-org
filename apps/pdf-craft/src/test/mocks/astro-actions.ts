import { vi } from "vitest";

export const actions = new Proxy(
  {},
  { get: () => vi.fn().mockResolvedValue({ data: null, error: null }) },
);

export const defineAction = vi.fn((config: unknown) => config);
