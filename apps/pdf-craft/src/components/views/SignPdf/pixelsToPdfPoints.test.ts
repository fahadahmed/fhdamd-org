import { describe, it, expect } from "vitest";
import { pixelsToPdfPoints } from "./pixelsToPdfPoints";

// A4 page: 595 × 842 pt. Canvas rendered at scale=0.5 → 297.5 × 421 px.

const PAGE_H = 842;
const SCALE = 0.5;

describe("pixelsToPdfPoints", () => {
  it("converts x coordinate correctly (no flip needed for x)", () => {
    const result = pixelsToPdfPoints(50, 100, 80, 30, SCALE, PAGE_H);
    // x: 50px / 0.5 = 100pt
    expect(result.x).toBeCloseTo(100);
  });

  it("converts width and height from pixels to PDF points", () => {
    const result = pixelsToPdfPoints(0, 0, 100, 40, SCALE, PAGE_H);
    expect(result.width).toBeCloseTo(200);   // 100px / 0.5 = 200pt
    expect(result.height).toBeCloseTo(80);   // 40px / 0.5 = 80pt
  });

  it("flips y-axis from top-left to bottom-left origin", () => {
    // Signature at top of canvas: canvasY=0, canvasH=60px → heightPt=120
    // pdfY = pageH - 0 - 120 = 722pt (near top in PDF coords)
    const result = pixelsToPdfPoints(0, 0, 100, 60, SCALE, PAGE_H);
    expect(result.y).toBeCloseTo(PAGE_H - 0 - 60 / SCALE);
  });

  it("positions a signature at the bottom of the page correctly", () => {
    // Bottom of a 421px canvas: canvasY = 421 - 30 = 391px
    const canvasH = PAGE_H * SCALE; // 421
    const sigHPx = 30;
    const canvasY = canvasH - sigHPx;
    const result = pixelsToPdfPoints(0, canvasY, 0, sigHPx, SCALE, PAGE_H);
    // pdfY = 842 - 391/0.5 - 30/0.5 = 842 - 782 - 60 = 0
    expect(result.y).toBeCloseTo(0);
  });

  it("returns zero x when input x is zero", () => {
    const result = pixelsToPdfPoints(0, 50, 40, 20, SCALE, PAGE_H);
    expect(result.x).toBe(0);
  });

  it("works at scale=1 (pixel === PDF point)", () => {
    const result = pixelsToPdfPoints(10, 20, 30, 40, 1, PAGE_H);
    expect(result.x).toBeCloseTo(10);
    expect(result.y).toBeCloseTo(PAGE_H - 20 - 40);
    expect(result.width).toBeCloseTo(30);
    expect(result.height).toBeCloseTo(40);
  });

  it("works at scale=2 (canvas pixels are 2× the PDF points)", () => {
    const result = pixelsToPdfPoints(100, 200, 80, 40, 2, PAGE_H);
    expect(result.x).toBeCloseTo(50);     // 100/2
    expect(result.width).toBeCloseTo(40); // 80/2
    expect(result.height).toBeCloseTo(20); // 40/2
    expect(result.y).toBeCloseTo(PAGE_H - 100 - 20); // 842 - 100 - 20 = 722
  });

  it("handles non-standard page heights (landscape / custom)", () => {
    const landscapeH = 595; // A4 landscape
    const result = pixelsToPdfPoints(0, 0, 0, 50, 1, landscapeH);
    expect(result.y).toBeCloseTo(landscapeH - 50);
  });
});
