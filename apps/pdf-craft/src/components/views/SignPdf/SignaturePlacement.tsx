'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Text, Button } from '@fhdamd/threads'
import { renderPdfPageToCanvas } from '../../../utils/lib/pdfRender'
import { pixelsToPdfPoints } from './pixelsToPdfPoints'
import type { SignatureOutput } from './SignatureModal'

export interface Placement {
  readonly page: number
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface PageDimension { readonly width: number; readonly height: number }

interface SignaturePlacementProps {
  readonly file: File
  readonly signature: SignatureOutput
  readonly pageDimensions: PageDimension[]
  readonly onConfirm: (placements: Placement[]) => void
  readonly onBack: () => void
}

// ── Page thumbnail (lazy via IntersectionObserver) ────────────────────────────

function PageThumb({ file, pageNumber, scale, isActive, onClick }: {
  readonly file: File
  readonly pageNumber: number
  readonly scale: number
  readonly isActive: boolean
  readonly onClick: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => { setRendered(false) }, [scale])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !rendered) {
        setRendered(true)
        renderPdfPageToCanvas(file, pageNumber, canvas, scale).catch(() => {})
      }
    }, { threshold: 0.1 })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [file, pageNumber, scale, rendered])

  return (
    <button
      onClick={onClick}
      aria-label={`Page ${pageNumber}`}
      style={{
        border: 'none', background: 'transparent', cursor: 'pointer',
        padding: '4px', borderRadius: 'var(--th-radius-sm)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        boxShadow: isActive ? '0 0 0 2px var(--th-color-accent)' : 'none',
        transition: 'box-shadow var(--th-duration-base) var(--th-ease-base)',
      }}
    >
      <canvas ref={ref} style={{ display: 'block', border: '1px solid var(--th-color-border)', borderRadius: '2px', backgroundColor: '#fff' }} />
      <Text as="span" size="xs" color="3">{pageNumber}</Text>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const DEFAULT_SIG_W_PT = 160
const DEFAULT_SIG_H_PT = 60
const THUMB_SCALE = 0.18
const MIN_SIG_W = 40
const MIN_SIG_H = 20

export default function SignaturePlacement({
  file, signature, pageDimensions, onConfirm, onBack,
}: SignaturePlacementProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(0.6)
  const [stampAll, setStampAll] = useState(false)

  // Signature rect in canvas-pixel space (top-left origin)
  const pageDim = pageDimensions[currentPage - 1] ?? { width: 595, height: 842 }
  const [sigRect, setSigRect] = useState({
    x: (pageDim.width * zoom - DEFAULT_SIG_W_PT * zoom) / 2,
    y: (pageDim.height * zoom) - DEFAULT_SIG_H_PT * zoom - 60,
    w: DEFAULT_SIG_W_PT * zoom,
    h: DEFAULT_SIG_H_PT * zoom,
  })

  // Reset placement when page or zoom changes
  useEffect(() => {
    const dim = pageDimensions[currentPage - 1] ?? { width: 595, height: 842 }
    setSigRect({
      x: (dim.width * zoom - DEFAULT_SIG_W_PT * zoom) / 2,
      y: dim.height * zoom - DEFAULT_SIG_H_PT * zoom - 60,
      w: DEFAULT_SIG_W_PT * zoom,
      h: DEFAULT_SIG_H_PT * zoom,
    })
  }, [currentPage, zoom, pageDimensions])

  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const [mainRendered, setMainRendered] = useState(false)

  // Re-render main canvas when page or zoom changes
  useEffect(() => { setMainRendered(false) }, [currentPage, zoom])
  useEffect(() => {
    const canvas = mainCanvasRef.current
    if (canvas && !mainRendered) {
      setMainRendered(true)
      renderPdfPageToCanvas(file, currentPage, canvas, zoom).catch(() => {})
    }
  }, [file, currentPage, zoom, mainRendered])

  // ── Drag handling ──────────────────────────────────────────────────────────

  const dragStartRef = useRef<{ mx: number; my: number; rx: number; ry: number } | null>(null)

  const onSigPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    dragStartRef.current = { mx: e.clientX, my: e.clientY, rx: sigRect.x, ry: sigRect.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onSigPointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return
    const dim = pageDimensions[currentPage - 1] ?? { width: 595, height: 842 }
    const maxX = dim.width * zoom - sigRect.w
    const maxY = dim.height * zoom - sigRect.h
    const nx = Math.max(0, Math.min(maxX, dragStartRef.current.rx + e.clientX - dragStartRef.current.mx))
    const ny = Math.max(0, Math.min(maxY, dragStartRef.current.ry + e.clientY - dragStartRef.current.my))
    setSigRect(prev => ({ ...prev, x: nx, y: ny }))
  }

  const onSigPointerUp = () => { dragStartRef.current = null }

  // ── Resize handling ────────────────────────────────────────────────────────

  const resizeStartRef = useRef<{ mx: number; my: number; rw: number; rh: number } | null>(null)

  const onResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    resizeStartRef.current = { mx: e.clientX, my: e.clientY, rw: sigRect.w, rh: sigRect.h }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onResizePointerMove = (e: React.PointerEvent) => {
    if (!resizeStartRef.current) return
    const dim = pageDimensions[currentPage - 1] ?? { width: 595, height: 842 }
    const nw = Math.max(MIN_SIG_W, Math.min(dim.width * zoom - sigRect.x, resizeStartRef.current.rw + e.clientX - resizeStartRef.current.mx))
    const nh = Math.max(MIN_SIG_H, Math.min(dim.height * zoom - sigRect.y, resizeStartRef.current.rh + e.clientY - resizeStartRef.current.my))
    setSigRect(prev => ({ ...prev, w: nw, h: nh }))
  }

  const onResizePointerUp = () => { resizeStartRef.current = null }

  // ── Confirm ────────────────────────────────────────────────────────────────

  const handleConfirm = useCallback(() => {
    const dim = pageDimensions[currentPage - 1] ?? { width: 595, height: 842 }
    const pdfCoords = pixelsToPdfPoints(sigRect.x, sigRect.y, sigRect.w, sigRect.h, zoom, dim.height)
    const placement: Placement = { page: currentPage, ...pdfCoords }

    if (stampAll) {
      const placements: Placement[] = pageDimensions.map((d, i) => {
        const wPt = pdfCoords.width
        const hPt = pdfCoords.height
        const xFrac = pdfCoords.x / dim.width
        const yFrac = pdfCoords.y / dim.height
        return { page: i + 1, x: xFrac * d.width, y: yFrac * d.height, width: wPt, height: hPt }
      })
      onConfirm(placements)
    } else {
      onConfirm([placement])
    }
  }, [currentPage, pageDimensions, sigRect, zoom, stampAll, onConfirm])

  const dim = pageDimensions[currentPage - 1] ?? { width: 595, height: 842 }
  const canvasW = Math.round(dim.width * zoom)
  const canvasH = Math.round(dim.height * zoom)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--th-space-4) var(--th-space-5)', borderBottom: '1px solid var(--th-color-border)', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
        <Text as="h2" size="lg" color="1" weight={650}>Place your signature</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-4)', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-2)', cursor: 'pointer', fontSize: 'var(--th-text-sm)', color: 'var(--th-color-text-2)' }}>
            <input type="checkbox" checked={stampAll} onChange={e => setStampAll(e.target.checked)} style={{ accentColor: 'var(--th-color-accent)' }} />
            <span>Also stamp initials on other pages</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-2)' }}>
            <Text as="span" size="xs" color="3">Zoom</Text>
            <input type="range" min={0.3} max={1.2} step={0.05} value={zoom} onChange={e => setZoom(Number(e.target.value))} aria-label="Zoom" style={{ width: '80px', accentColor: 'var(--th-color-accent)' }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Page thumbnail rail */}
        <div style={{ width: '100px', flexShrink: 0, borderRight: '1px solid var(--th-color-border)', overflowY: 'auto', padding: 'var(--th-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--th-space-2)', backgroundColor: 'var(--th-color-surface-2)' }}>
          {pageDimensions.map((_, i) => (
            <PageThumb
              key={i + 1}
              file={file}
              pageNumber={i + 1}
              scale={THUMB_SCALE}
              isActive={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
            />
          ))}
        </div>

        {/* Main canvas area */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'var(--th-space-6)', backgroundColor: 'var(--th-color-surface-1)' }}>
          {/* Page + signature overlay container */}
          <div style={{ position: 'relative', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <canvas
              ref={mainCanvasRef}
              width={canvasW}
              height={canvasH}
              style={{ display: 'block', backgroundColor: '#fff' }}
            />
            {/* Draggable signature overlay */}
            <div
              onPointerDown={onSigPointerDown}
              onPointerMove={onSigPointerMove}
              onPointerUp={onSigPointerUp}
              style={{
                position: 'absolute',
                left: sigRect.x, top: sigRect.y,
                width: sigRect.w, height: sigRect.h,
                cursor: 'move', userSelect: 'none', touchAction: 'none',
                border: '1.5px dashed var(--th-color-accent)',
                borderRadius: '2px',
              }}
            >
              <img
                src={signature.dataUrl}
                alt="Signature"
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', display: 'block' }}
                draggable={false}
              />
              {/* Resize handle — bottom-right corner */}
              <button
                onPointerDown={onResizePointerDown}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
                aria-label="Resize signature"
                style={{
                  position: 'absolute', bottom: -5, right: -5,
                  width: '12px', height: '12px',
                  backgroundColor: 'var(--th-color-accent)',
                  borderRadius: '2px', cursor: 'nwse-resize',
                  touchAction: 'none', border: 'none', padding: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--th-space-4) var(--th-space-5)', borderTop: '1px solid var(--th-color-border)', backgroundColor: 'var(--th-color-surface-2)' }}>
        <Text as="span" size="sm" color="3">Page {currentPage} of {pageDimensions.length}</Text>
        <div style={{ display: 'flex', gap: 'var(--th-space-3)' }}>
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button variant="solid-terra" onClick={handleConfirm}>Place Signature</Button>
        </div>
      </div>
    </div>
  )
}
