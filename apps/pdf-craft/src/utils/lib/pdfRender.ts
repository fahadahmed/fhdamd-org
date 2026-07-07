'use client'

// The pdfjs library references browser-only globals (DOMMatrix) at evaluation
// time, so we import it dynamically to keep it out of Astro's SSR module graph.
// The worker is loaded from unpkg.com (version-locked) to avoid Vite/Astro
// asset-resolution issues with node_modules ?url imports.
async function getPdfjsLib() {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }
  return pdfjs
}

/**
 * Returns the total number of pages in a PDF file.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const pdfjs = await getPdfjsLib()
  const bytes = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: bytes }).promise
  const count = doc.numPages
  // pdfjs-dist v4+ removed destroy() — cleanup() releases internal resources
  await doc.cleanup()
  return count
}

/**
 * Renders a single page of a PDF file onto an existing <canvas> element.
 *
 * @param file       The PDF File object to render from.
 * @param pageNumber 1-indexed page number.
 * @param canvas     The <canvas> element to render into.
 * @param scale      Viewport scale factor (1 = original size, 0.5 = half).
 */
export async function renderPdfPageToCanvas(
  file: File,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<void> {
  const pdfjs = await getPdfjsLib()
  const bytes = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: bytes }).promise
  const page = await doc.getPage(pageNumber)
  const viewport = page.getViewport({ scale })

  canvas.width = viewport.width
  canvas.height = viewport.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D canvas context')

  await page.render({ canvasContext: ctx, viewport }).promise

  page.cleanup()
  await doc.cleanup()
}
