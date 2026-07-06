'use client'
import * as pdfjs from 'pdfjs-dist'

// Use the bundled worker so no separate worker file needs to be served.
// The ?url import tells Vite/Astro to resolve the path at build time.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/**
 * Returns the total number of pages in a PDF file.
 * Resolves after pdf.js has parsed the cross-reference table — fast even for
 * large documents since it does not decode page content.
 */
export async function getPdfPageCount(file: File): Promise<number> {
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
