import { describe, expect, it } from "vitest";
import { cmsImage, cmsSrcset } from "./image";

describe("cmsImage", () => {
  it("asks for a modern, compressed picture at the given width", () => {
    expect(cmsImage("https://www.datocms-assets.com/1/a.png", 480)).toBe("https://www.datocms-assets.com/1/a.png?auto=format,compress&w=480");
  });

  it("drops any parameters the address already had", () => {
    expect(cmsImage("https://www.datocms-assets.com/1/a.png?w=100&dl=a.png", 300.4)).toBe("https://www.datocms-assets.com/1/a.png?auto=format,compress&w=300");
  });
});

describe("cmsSrcset", () => {
  it("lists each width with its descriptor", () => {
    expect(cmsSrcset("https://x/a.png", [240, 480])).toBe("https://x/a.png?auto=format,compress&w=240 240w, https://x/a.png?auto=format,compress&w=480 480w");
  });
});
