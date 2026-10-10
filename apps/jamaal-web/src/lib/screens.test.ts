import { describe, expect, it } from "vitest";
import { screen } from "./screens";

describe("screen", () => {
  it("returns a screenshot by file name", () => {
    expect(screen("g-TD-01")).toBeTruthy();
  });

  it("fails loudly for a name that does not exist", () => {
    expect(() => screen("g-nope")).toThrow('No screenshot named "g-nope"');
  });
});
