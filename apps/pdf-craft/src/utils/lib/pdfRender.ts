'use client'

// pdfjs-dist references browser-only globals (DOMMatrix etc.) at module
// evaluation time, so it must NOT be statically imported — Astro evaluates
// static imports server-side during SSR even for client:load components.
// Dynamic import defers evaluation until the function is first called,
// which only happens in the browser after hydration.
async function getPdfjsLib() {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()
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
  doc.destroy()
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
  doc.destroy()
}
