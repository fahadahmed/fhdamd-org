import { describe, expect, it } from "vitest";
import { cssVars } from "./cssVars";

describe("cssVars", () => {
  it("writes custom properties", () => {
    expect(cssVars({ w: "300px", z: 2 })).toBe("--w: 300px; --z: 2");
  });

  it("leaves out anything empty, and returns nothing when there is nothing to set", () => {
    expect(cssVars({ a: undefined, b: null, c: false, d: "" })).toBeUndefined();
    expect(cssVars({ bezel: "#000", ratio: false })).toBe("--bezel: #000");
  });

  it("keeps a zero", () => {
    expect(cssVars({ x: 0 })).toBe("--x: 0");
  });
});
