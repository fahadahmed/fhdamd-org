import { describe, it, expect } from "vitest";
import { computeReadTime } from "./computeReadTime";

describe("computeReadTime", () => {
  it("rounds to the nearest minute at 200 words per minute", () => {
    const body = Array(400).fill("word").join(" ");
    expect(computeReadTime(body)).toBe("2 min read");
  });

  it("never reports less than 1 minute for a short body", () => {
    expect(computeReadTime("a few words here")).toBe("1 min read");
  });

  it("treats an empty body as 1 minute", () => {
    expect(computeReadTime("")).toBe("1 min read");
  });

  it("ignores extra whitespace when counting words", () => {
    const body = Array(400).fill("word").join("   \n  ");
    expect(computeReadTime(body)).toBe("2 min read");
  });
});
