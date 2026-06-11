import { describe, it, expect } from "vitest";
import { indexSectionHeaders, titleToReact } from "./sections";
import type { SectionHeader } from "../types";

describe("titleToReact", () => {
  it("returns plain string as-is when no asterisk markers", () => {
    const result = titleToReact("Hello world");
    expect(result).toEqual(["Hello world"]);
  });

  it("wraps *marked* text in an <em> element", () => {
    const result = titleToReact("Make *anything* a PDF");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("Make ");
    expect(result[2]).toBe(" a PDF");

    const em = result[1] as React.ReactElement;
    expect(em.type).toBe("em");
    expect(em.props.children).toBe("anything");
  });

  it("handles multiple marked segments", () => {
    const result = titleToReact("*Fast* and *free*");
    // ["", <em>Fast</em>, " and ", <em>free</em>, ""]
    expect(result).toHaveLength(5);
  });

  it("returns empty string for empty input", () => {
    const result = titleToReact("");
    expect(result).toEqual([""]);
  });
});

describe("indexSectionHeaders", () => {
  const headers: SectionHeader[] = [
    { key: "hero", eyebrow: "Welcome", title: "Hero Section" },
    { key: "pricing", eyebrow: "Plans", title: "Pricing Section", intro: "Choose a plan" },
  ];

  it("indexes headers by their key", () => {
    const result = indexSectionHeaders(headers);
    expect(result["hero"]).toEqual(headers[0]);
    expect(result["pricing"]).toEqual(headers[1]);
  });

  it("returns an empty object for an empty array", () => {
    expect(indexSectionHeaders([])).toEqual({});
  });

  it("preserves optional intro field", () => {
    const result = indexSectionHeaders(headers);
    expect(result["pricing"].intro).toBe("Choose a plan");
    expect(result["hero"].intro).toBeUndefined();
  });
});
