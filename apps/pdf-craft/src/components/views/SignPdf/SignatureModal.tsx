'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Stack, Text, Button, Input, FileDropzone } from '@fhdamd/threads'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SignatureOutput {
  readonly dataUrl: string
  readonly source: 'typed' | 'drawn' | 'uploaded'
  readonly signerName: string
}

interface SignatureModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: (output: SignatureOutput) => void
}

// ── Font styles for the Type tab grid ────────────────────────────────────────

const FONT_STYLES = [
  { id: 'caveat',          family: 'Caveat',              size: 40, weight: '400', style: 'normal' },
  { id: 'dancing',         family: 'Dancing Script',      size: 34, weight: '400', style: 'normal' },
  { id: 'sacramento',      family: 'Sacramento',          size: 38, weight: '400', style: 'normal' },
  { id: 'pacifico',        family: 'Pacifico',            size: 30, weight: '400', style: 'normal' },
  { id: 'greatvibes',      family: 'Great Vibes',         size: 38, weight: '400', style: 'normal' },
  { id: 'dancing-bold',    family: 'Dancing Script',      size: 32, weight: '700', style: 'normal' },
  { id: 'caveat-italic',   family: 'Caveat',              size: 36, weight: '700', style: 'italic' },
  { id: 'print-bold',      family: 'Bricolage Grotesque', size: 22, weight: '700', style: 'normal', uppercase: true },
  { id: 'print-regular',   family: 'Bricolage Grotesque', size: 22, weight: '400', style: 'normal' },
] as const

// ── Ink colours ───────────────────────────────────────────────────────────────

const INK_COLORS = [
  { id: 'black',  hex: '#1a1916', label: 'Black' },
  { id: 'navy',   hex: '#1e3a5f', label: 'Navy' },
  { id: 'blue',   hex: '#2563eb', label: 'Blue' },
  { id: 'red',    hex: '#b91c1c', label: 'Red' },
  { id: 'rainbow', hex: 'rainbow', label: 'Rainbow' },
] as const

type InkColorId = (typeof INK_COLORS)[number]['id']
type FontStyleId = (typeof FONT_STYLES)[number]['id']

const CANVAS_W = 380
const CANVAS_H = 120
const STORAGE_KEY = 'riqa-saved-signature'

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderSignatureToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  fontStyle: (typeof FONT_STYLES)[number],
  inkId: InkColorId,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = globalThis.devicePixelRatio || 1
  canvas.width = CANVAS_W * dpr
  canvas.height = CANVAS_H * dpr
  canvas.style.width = `${CANVAS_W}px`
  canvas.style.height = `${CANVAS_H}px`
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

  const displayText = fontStyle.uppercase ? text.toUpperCase() : text
  const cssFont = `${fontStyle.style} ${fontStyle.weight} ${fontStyle.size}px "${fontStyle.family}", cursive`
  ctx.font = cssFont

  if (inkId === 'rainbow') {
    const grad = ctx.createLinearGradient(0, 0, CANVAS_W, 0)
    grad.addColorStop(0,    '#ef4444')
    grad.addColorStop(0.25, '#f59e0b')
    grad.addColorStop(0.5,  '#22c55e')
    grad.addColorStop(0.75, '#3b82f6')
    grad.addColorStop(1,    '#a855f7')
    ctx.fillStyle = grad
  } else {
    const found = INK_COLORS.find(c => c.id === inkId)
    ctx.fillStyle = found?.hex ?? '#1a1916'
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(displayText, CANVAS_W / 2, CANVAS_H / 2)
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function KeyboardIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" /></svg>
}
function PenIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
}
function UploadIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SignatureModal({ isOpen, onClose, onConfirm }: SignatureModalProps) {
  const [tab, setTab] = useState<'typed' | 'drawn' | 'uploaded'>('typed')
  const [signerName, setSignerName] = useState('')
  const [selectedFont, setSelectedFont] = useState<FontStyleId>('caveat')
  const [inkColor, setInkColor] = useState<InkColorId>('black')
  const [saveForLater, setSaveForLater] = useState(false)
  const [drawDataUrl, setDrawDataUrl] = useState<string | null>(null)
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const previewCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({})
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Load saved signature
  useEffect(() => {
    if (!isOpen) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { signerName: sn, font, ink } = JSON.parse(saved)
        if (sn) setSignerName(sn)
        if (font) setSelectedFont(font as FontStyleId)
        if (ink) setInkColor(ink as InkColorId)
        setSaveForLater(true)
      } catch { /* ignore */ }
    }
  }, [isOpen])

  // Re-render all font previews when name or ink changes
  useEffect(() => {
    FONT_STYLES.forEach(fs => {
      const canvas = previewCanvasRefs.current[fs.id]
      if (canvas) renderSignatureToCanvas(canvas, signerName || 'Your Name', fs, inkColor)
    })
  }, [signerName, inkColor])

  // ── Draw tab handlers ──────────────────────────────────────────────────────

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    lastPos.current = getPos(e)
  }

  const doDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawCanvasRef.current) return
    const ctx = drawCanvasRef.current.getContext('2d')
    if (!ctx || !lastPos.current) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = INK_COLORS.find(c => c.id === inkColor)?.hex ?? '#1a1916'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
    setDrawDataUrl(drawCanvasRef.current.toDataURL('image/png'))
  }

  const endDraw = () => { setIsDrawing(false); lastPos.current = null }

  const clearDraw = useCallback(() => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    setDrawDataUrl(null)
  }, [])

  // ── Upload tab handler ─────────────────────────────────────────────────────

  const handleUpload = (files: File[]) => {
    const file = files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setUploadDataUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ── Confirm ────────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    let dataUrl: string | null = null
    let source: SignatureOutput['source'] = tab

    if (tab === 'typed') {
      const offscreen = document.createElement('canvas')
      const fs = FONT_STYLES.find(f => f.id === selectedFont) ?? FONT_STYLES[0]
      renderSignatureToCanvas(offscreen, signerName || 'Signature', fs, inkColor)
      dataUrl = offscreen.toDataURL('image/png')
    } else if (tab === 'drawn') {
      dataUrl = drawDataUrl
    } else {
      dataUrl = uploadDataUrl
    }

    if (!dataUrl) return

    if (saveForLater) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ signerName, font: selectedFont, ink: inkColor }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    onConfirm({ dataUrl, source, signerName })
  }

  const canConfirm = tab === 'typed'
    ? signerName.trim().length > 0
    : tab === 'drawn' ? !!drawDataUrl : !!uploadDataUrl

  if (!isOpen) return null

  const TABS = [
    { id: 'typed' as const,    icon: <KeyboardIcon />, label: 'Type',   desc: 'Enter your name and create a signature with ready-made fonts' },
    { id: 'drawn' as const,    icon: <PenIcon />,      label: 'Draw',   desc: 'Handwrite your signature using mouse or trackpad' },
    { id: 'uploaded' as const, icon: <UploadIcon />,   label: 'Upload', desc: 'Use a signature image from your device' },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create your signature"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 'var(--th-space-4)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--th-color-surface-1)',
        borderRadius: 'var(--th-radius-lg)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        width: '100%', maxWidth: '720px',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--th-space-5) var(--th-space-6)', borderBottom: '1px solid var(--th-color-border)' }}>
          <Text as="h2" size="lg" color="1" weight={650}>Create your signature</Text>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--th-color-text-3)', padding: '4px', borderRadius: 'var(--th-radius-sm)', display: 'flex' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', minHeight: '420px' }}>
          {/* Left tab rail */}
          <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid var(--th-color-border)', padding: 'var(--th-space-3)' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  padding: 'var(--th-space-3)', borderRadius: 'var(--th-radius-md)',
                  backgroundColor: tab === t.id ? 'var(--th-color-accent)' : 'transparent',
                  color: tab === t.id ? '#fff' : 'var(--th-color-text-2)',
                  marginBottom: 'var(--th-space-1)',
                  transition: 'background-color var(--th-duration-base) var(--th-ease-base)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--th-space-3)' }}>
                  <div style={{ flexShrink: 0, marginTop: '2px', opacity: tab === t.id ? 1 : 0.6 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--th-font-display)', fontSize: 'var(--th-text-sm)', fontWeight: 600, marginBottom: '2px' }}>{t.label}</div>
                    <div style={{ fontSize: 'var(--th-text-xs)', opacity: 0.75, lineHeight: 1.4 }}>{t.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, padding: 'var(--th-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--th-space-4)' }}>
            {/* Name field — persistent across all tabs */}
            <Input
              type="text"
              id="signer-name"
              label="Full name (recorded with the signature)"
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              autoComplete="name"
            />

            {/* Type tab */}
            {tab === 'typed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--th-space-3)', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text size="xs" color="3">Choose a style and ink color</Text>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {INK_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setInkColor(c.id)}
                        aria-label={c.label}
                        style={{
                          width: '22px', height: '22px', borderRadius: '50%', border: 'none',
                          cursor: 'pointer', padding: 0,
                          background: c.hex === 'rainbow'
                            ? 'conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)'
                            : c.hex,
                          outline: inkColor === c.id ? `2px solid var(--th-color-accent)` : 'none',
                          outlineOffset: '2px',
                          transition: 'outline var(--th-duration-base) var(--th-ease-base)',
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/* Font grid — 3 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--th-space-2)', flex: 1 }}>
                  {FONT_STYLES.map(fs => (
                    <button
                      key={fs.id}
                      onClick={() => setSelectedFont(fs.id)}
                      style={{
                        border: `1px solid ${selectedFont === fs.id ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
                        borderRadius: 'var(--th-radius-sm)',
                        background: selectedFont === fs.id ? 'var(--th-color-surface-2)' : 'var(--th-color-surface-1)',
                        cursor: 'pointer', padding: '4px 2px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color var(--th-duration-base) var(--th-ease-base)',
                        overflow: 'hidden',
                      }}
                    >
                      <canvas
                        ref={el => { previewCanvasRefs.current[fs.id] = el }}
                        style={{ display: 'block', maxWidth: '100%', pointerEvents: 'none' }}
                        width={CANVAS_W}
                        height={CANVAS_H}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Draw tab */}
            {tab === 'drawn' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--th-space-3)', flex: 1 }}>
                <canvas
                  ref={drawCanvasRef}
                  width={480}
                  height={200}
                  onPointerDown={startDraw}
                  onPointerMove={doDraw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                  style={{
                    border: '1px solid var(--th-color-border)',
                    borderRadius: 'var(--th-radius-md)',
                    cursor: 'crosshair', touchAction: 'none',
                    background: '#fff', width: '100%',
                  }}
                />
                <div>
                  <Button type="button" variant="ghost" size="sm" onClick={clearDraw}>Clear</Button>
                </div>
              </div>
            )}

            {/* Upload tab */}
            {tab === 'uploaded' && (
              <div style={{ flex: 1 }}>
                {uploadDataUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--th-space-3)' }}>
                    <img src={uploadDataUrl} alt="Uploaded signature" style={{ maxHeight: '120px', objectFit: 'contain', border: '1px solid var(--th-color-border)', borderRadius: 'var(--th-radius-sm)', background: '#fff' }} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploadDataUrl(null)}>Remove</Button>
                  </div>
                ) : (
                  <FileDropzone
                    label="Upload signature PNG"
                    hint="PNG only — transparency is preserved"
                    accept="image/png"
                    onFiles={handleUpload}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--th-space-4) var(--th-space-6)', borderTop: '1px solid var(--th-color-border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-2)', cursor: 'pointer', fontSize: 'var(--th-text-sm)', color: 'var(--th-color-text-2)' }}>
            <input
              type="checkbox"
              checked={saveForLater}
              onChange={e => setSaveForLater(e.target.checked)}
              style={{ accentColor: 'var(--th-color-accent)', width: '16px', height: '16px' }}
            />
            Save for future use
          </label>
          <Button variant="solid-terra" onClick={handleConfirm} disabled={!canConfirm}>
            Place in PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
