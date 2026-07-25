import { describe, it, expect } from "vitest";
import { highlightCode } from "./highlightCode";

describe("highlightCode", () => {
  it("returns one line of tokens per source line", async () => {
    const tokens = await highlightCode("const a = 1;\nconst b = 2;", "ts");
    expect(tokens).toHaveLength(2);
  });

  it("assigns a color to each token", async () => {
    const tokens = await highlightCode("const a = 1;", "ts");
    const flat = tokens.flat();
    expect(flat.length).toBeGreaterThan(0);
    for (const token of flat) {
      expect(typeof token.color).toBe("string");
      expect(token.color?.length).toBeGreaterThan(0);
    }
  });

  it("preserves the original source when tokens are joined back together", async () => {
    const source = "function greet(name: string) {\n  return `hi ${name}`;\n}";
    const tokens = await highlightCode(source, "ts");
    const rejoined = tokens
      .map((line) => line.map((t) => t.content).join(""))
      .join("\n");
    expect(rejoined).toBe(source);
  });
});
