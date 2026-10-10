import { describe, expect, it, vi } from "vitest";
import { CONSENT_KEY, browserStore, readConsent, writeConsent } from "./consent";

const memory = (initial: Record<string, string> = {}) => {
  const data = { ...initial };
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
    data,
  };
};

describe("readConsent", () => {
  it("returns the saved choice", () => {
    expect(readConsent(memory({ [CONSENT_KEY]: "granted" }))).toBe("granted");
    expect(readConsent(memory({ [CONSENT_KEY]: "denied" }))).toBe("denied");
  });

  it("returns null when nothing valid is saved", () => {
    expect(readConsent(memory())).toBeNull();
    expect(readConsent(memory({ [CONSENT_KEY]: "maybe" }))).toBeNull();
    expect(readConsent(undefined)).toBeNull();
  });

  it("treats blocked storage as no choice", () => {
    const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => {} };
    expect(readConsent(blocked)).toBeNull();
  });
});

describe("writeConsent", () => {
  it("saves the choice", () => {
    const store = memory();
    writeConsent(store, "denied");
    expect(store.data[CONSENT_KEY]).toBe("denied");
  });

  it("does not throw when storage is blocked or missing", () => {
    const blocked = { getItem: () => null, setItem: () => { throw new Error("blocked"); } };
    expect(() => writeConsent(blocked, "granted")).not.toThrow();
    expect(() => writeConsent(undefined, "granted")).not.toThrow();
  });
});

describe("browserStore", () => {
  it("returns localStorage when the browser allows it", () => {
    expect(browserStore()).toBe(globalThis.localStorage);
  });

  it("returns undefined when access throws", () => {
    const spy = vi.spyOn(globalThis, "localStorage", "get").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(browserStore()).toBeUndefined();
    spy.mockRestore();
  });
});
