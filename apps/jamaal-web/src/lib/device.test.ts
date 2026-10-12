import { describe, expect, it } from "vitest";
import { DEVICE_TYPES, DEVICE_WIDTHS, deviceAspect } from "./device";

describe("deviceAspect", () => {
  it("gives every framed device a default screen ratio", () => {
    for (const type of DEVICE_TYPES.filter((t) => t !== "widget")) {
      expect(deviceAspect(type)).toMatch(/^\d+ \/ \d+$/);
    }
  });

  it("lets a widget size to its image", () => {
    expect(deviceAspect("widget")).toBeNull();
  });

  it("prefers an explicit ratio, for example the open iPhone Duo", () => {
    expect(deviceAspect("duo", "952 / 673")).toBe("952 / 673");
    expect(deviceAspect("ipad", "1170 / 820")).toBe("1170 / 820");
  });
});

describe("DEVICE_WIDTHS", () => {
  it("lists ascending widths for every type", () => {
    for (const type of DEVICE_TYPES) {
      const widths = DEVICE_WIDTHS[type];
      expect(widths.length).toBeGreaterThan(1);
      expect([...widths].sort((a, b) => a - b)).toEqual(widths);
    }
  });
});
