/**
 * Converts a signature placement rectangle from canvas-pixel space
 * (top-left origin, as used by the browser) to PDF point space
 * (bottom-left origin, as used by pdf-lib).
 *
 * @param x             Left edge of the signature in canvas pixels.
 * @param y             Top edge of the signature in canvas pixels.
 * @param width         Signature width in canvas pixels.
 * @param height        Signature height in canvas pixels.
 * @param scale         Canvas scale factor (canvasPixels = pdfPoints × scale).
 * @param pageHeightPt  PDF page height in points (from pdf.js getViewport({scale:1})).
 *
 * @returns Placement in PDF points with bottom-left origin, ready for pdf-lib's
 *          page.drawImage({ x, y, width, height }).
 */
export function pixelsToPdfPoints(
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
  pageHeightPt: number,
): { x: number; y: number; width: number; height: number } {
  const xPt = x / scale
  const yPt = y / scale
  const wPt = width / scale
  const hPt = height / scale
  return {
    x: xPt,
    // PDF y=0 is the bottom edge; flip from top-left origin.
    // pdf-lib positions images by their bottom-left corner, so subtract
    // both the top offset and the image height.
    y: pageHeightPt - yPt - hPt,
    width: wPt,
    height: hPt,
  }
}
