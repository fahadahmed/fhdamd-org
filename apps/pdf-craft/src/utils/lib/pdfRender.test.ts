import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock pdfjs-dist before importing pdfRender (dynamic import so we mock the module)
const mockPage = {
  getViewport: vi.fn().mockReturnValue({ width: 100, height: 150 }),
  render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
  cleanup: vi.fn(),
};
const mockDoc = {
  numPages: 5,
  getPage: vi.fn().mockResolvedValue(mockPage),
  cleanup: vi.fn().mockResolvedValue(undefined),
};
const mockGetDocument = vi.fn().mockReturnValue({ promise: Promise.resolve(mockDoc) });

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  version: "6.1.200",
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
}));

import { getPdfPageCount, getPdfPageDimensions, renderPdfPageToCanvas } from "./pdfRender";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockDoc) });
  mockDoc.getPage.mockResolvedValue(mockPage);
  mockDoc.cleanup.mockResolvedValue(undefined);
  mockDoc.numPages = 5;
  mockPage.render.mockReturnValue({ promise: Promise.resolve() });
});

describe("getPdfPageCount", () => {
  it("returns the number of pages from the PDF document", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    const count = await getPdfPageCount(file);
    expect(count).toBe(5);
    expect(mockGetDocument).toHaveBeenCalledWith({ data: expect.any(ArrayBuffer) });
  });

  it("calls cleanup() on the document after reading page count", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    await getPdfPageCount(file);
    expect(mockDoc.cleanup).toHaveBeenCalled();
  });

  it("propagates errors thrown by getDocument", async () => {
    mockGetDocument.mockReturnValue({ promise: Promise.reject(new Error("load failed")) });
    const file = new File(["pdf"], "bad.pdf", { type: "application/pdf" });
    await expect(getPdfPageCount(file)).rejects.toThrow("load failed");
  });
});

describe("renderPdfPageToCanvas", () => {
  it("sets canvas dimensions from the page viewport", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    const canvas = { width: 0, height: 0, getContext: vi.fn().mockReturnValue({}) } as unknown as HTMLCanvasElement;
    await renderPdfPageToCanvas(file, 1, canvas, 0.5);
    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(150);
    expect(mockPage.getViewport).toHaveBeenCalledWith({ scale: 0.5 });
  });

  it("calls page.render() with the canvas context and viewport", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    const ctx = {};
    const canvas = { width: 0, height: 0, getContext: vi.fn().mockReturnValue(ctx) } as unknown as HTMLCanvasElement;
    await renderPdfPageToCanvas(file, 2, canvas, 1);
    expect(mockPage.render).toHaveBeenCalledWith({ canvasContext: ctx, viewport: expect.any(Object) });
    expect(mockDoc.getPage).toHaveBeenCalledWith(2);
  });

  it("throws when canvas 2D context is unavailable", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    const canvas = { width: 0, height: 0, getContext: vi.fn().mockReturnValue(null) } as unknown as HTMLCanvasElement;
    await expect(renderPdfPageToCanvas(file, 1, canvas, 1)).rejects.toThrow("Could not get 2D canvas context");
  });

  it("calls cleanup on page and document after rendering", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    const canvas = { width: 0, height: 0, getContext: vi.fn().mockReturnValue({}) } as unknown as HTMLCanvasElement;
    await renderPdfPageToCanvas(file, 1, canvas, 1);
    expect(mockPage.cleanup).toHaveBeenCalled();
    expect(mockDoc.cleanup).toHaveBeenCalled();
  });
});

describe("getPdfPageDimensions", () => {
  it("returns width and height for each page at scale=1", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    const dims = await getPdfPageDimensions(file);
    expect(dims).toHaveLength(5); // mockDoc.numPages = 5
    expect(dims[0]).toEqual({ width: 100, height: 150 }); // from mockPage.getViewport
  });

  it("calls getPage for each page (1-indexed)", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    await getPdfPageDimensions(file);
    expect(mockDoc.getPage).toHaveBeenCalledWith(1);
    expect(mockDoc.getPage).toHaveBeenCalledWith(5);
  });

  it("calls cleanup on each page and the document", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    await getPdfPageDimensions(file);
    expect(mockPage.cleanup).toHaveBeenCalledTimes(5);
    expect(mockDoc.cleanup).toHaveBeenCalled();
  });

  it("uses scale=1 for the viewport (returns PDF point dimensions)", async () => {
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    await getPdfPageDimensions(file);
    expect(mockPage.getViewport).toHaveBeenCalledWith({ scale: 1 });
  });
});
