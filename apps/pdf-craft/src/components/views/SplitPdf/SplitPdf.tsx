'use client'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { actions } from 'astro:actions'
import { Container, Stack, Text, Button, FileDropzone, Callout, Card } from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { logEvent } from '../../../utils/lib/analytics'
import { buildPrepareSession } from '../../../utils/lib/operationSession'
import { getPdfPageCount, renderPdfPageToCanvas } from '../../../utils/lib/pdfRender'
import { DownloadIcon, ErrorCallout } from '../../shared'

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const sz = (n = 16) => ({ width: n, height: n, display: 'block' })

function ChevronLeftIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={sz()}><polyline points="15 18 9 12 15 6" /></svg>
}
function ChevronRightIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={sz()}><polyline points="9 18 15 12 9 6" /></svg>
}
function RotateIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={sz()}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
}
function CopyIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={sz()}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={sz()}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
}
function ScissorsIcon({ size = 12 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={sz(size)}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={sz(10)}><polyline points="20 6 9 17 4 12" /></svg>
}

// ── Toolbar icon button ───────────────────────────────────────────────────────

function ToolbarBtn({ icon, label, disabled, onClick }: {
  readonly icon: React.ReactNode
  readonly label: string
  readonly disabled?: boolean
  readonly onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        border: 'none', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '6px', borderRadius: 'var(--th-radius-sm)', display: 'inline-flex',
        color: disabled ? 'var(--th-color-text-3)' : 'var(--th-color-text-2)',
        opacity: disabled ? 0.4 : 1,
        transition: 'background var(--th-duration-base) var(--th-ease-base)',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--th-color-surface-2)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
    >
      {icon}
    </button>
  )
}

// ── Page thumbnail (real pdf.js canvas, lazy via IntersectionObserver) ────────

function PageThumb({ file, pageNumber, scale, mode, isSelected, onToggleSelect }: {
  readonly file: File
  readonly pageNumber: number
  readonly scale: number
  readonly mode: 'split' | 'extract'
  readonly isSelected: boolean
  readonly onToggleSelect: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => { setRendered(false) }, [scale])

  useEffect(() => {
    const canvas = canvasRef.current
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '0 4px', flexShrink: 0 }}>
      <button
        onClick={onToggleSelect}
        style={{
          position: 'relative', display: 'inline-flex', padding: '4px',
          border: 'none', background: 'transparent', borderRadius: 'var(--th-radius-sm)',
          cursor: 'pointer',
          boxShadow: isSelected
            ? '0 0 0 2px var(--th-color-accent)'
            : '0 0 0 1px transparent',
          transition: 'box-shadow var(--th-duration-base) var(--th-ease-base)',
        }}
        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px var(--th-color-border, #ccc)' }}
        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
      >
        {mode === 'extract' && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            width: '16px', height: '16px', borderRadius: '3px',
            border: `1px solid ${isSelected ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
            background: isSelected ? 'var(--th-color-accent)' : 'var(--th-color-surface-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
          }}>
            {isSelected && <CheckIcon />}
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            border: '1px solid var(--th-color-border)',
            borderRadius: '3px',
            background: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
        />
      </button>
      <Text as="span" size="xs" color="3">{pageNumber}</Text>
    </div>
  )
}

// ── Split gap (scissors button between pages) ─────────────────────────────────

function SplitGap({ active, height, onClick }: {
  readonly active: boolean
  readonly height: number
  readonly onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const show = active || hovered

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={active ? 'Remove split point' : 'Add split point'}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', width: '36px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', height,
      }}
    >
      {/* Dashed vertical line */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: `1.5px ${show ? 'solid' : 'dashed'} ${show ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
        opacity: show ? 1 : 0.6,
        transition: 'all var(--th-duration-base) var(--th-ease-base)',
      }} />
      {/* Scissors button */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '26px', height: '26px', borderRadius: '50%',
        border: `1px solid ${active ? 'var(--th-color-accent)' : hovered ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
        background: active ? 'var(--th-color-accent)' : 'var(--th-color-surface-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? '#fff' : hovered ? 'var(--th-color-accent)' : 'var(--th-color-text-3)',
        boxShadow: hovered && !active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        transition: 'all var(--th-duration-base) var(--th-ease-base)',
      }}>
        <ScissorsIcon size={13} />
      </div>
      {/* Tooltip */}
      {hovered && !active && (
        <div style={{
          position: 'absolute', top: '-34px', left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', background: 'var(--th-color-text-1)', color: 'var(--th-color-surface-1)',
          fontSize: 'var(--th-text-xs)', padding: '4px 8px', borderRadius: 'var(--th-radius-sm)',
          pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          Click to split here
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface PageEntry { readonly id: string; rotation: number }

function makePages(n: number): PageEntry[] {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i}-${Math.random().toString(36).slice(2, 7)}`, rotation: 0 }))
}

export default function SplitPdf({
  creditCost, isAuthenticated = false,
}: { readonly creditCost: number; readonly isAuthenticated?: boolean }) {
  const [file, setFile]                 = useState<File | null>(null)
  const [pages, setPages]               = useState<PageEntry[]>([])
  const [mode, setMode]                 = useState<'split' | 'extract'>('split')
  const [splitAfter, setSplitAfter]     = useState<Set<string>>(new Set())
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [zoom, setZoom]                 = useState(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [claimToken, setClaimToken]     = useState<string | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]   = useState('Split')

  const scale = zoom / 100 * 0.22  // map 60–150 zoom to canvas scale

  const prepareSession = buildPrepareSession({
    isAuthenticated, creditCost, defaultLabel: 'Split',
    setButtonLabel, setError: (e) => setError(e), setProcessing: setIsProcessing,
  })

  // ── File selection ──

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    const f = files[0]
    setFile(f); setDownloadLink(null); setClaimToken(null); setError(null)
    setSplitAfter(new Set()); setSelected(new Set())
    try {
      const count = await getPdfPageCount(f)
      setPages(makePages(count))
    } catch (err) {
      console.error('[SplitPdf] getPdfPageCount failed:', err)
      setError('Could not read the PDF. Make sure it is a valid, unencrypted file.')
      setFile(null)
    }
  }, [])

  // ── Page operations ──

  const singleSelectedIndex = useMemo(() => {
    if (selected.size !== 1) return -1
    const id = [...selected][0]
    return pages.findIndex(p => p.id === id)
  }, [selected, pages])

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleSplit(id: string) {
    setSplitAfter(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
    setError(null)
  }
  function moveSelected(dir: -1 | 1) {
    if (singleSelectedIndex === -1) return
    const ni = singleSelectedIndex + dir
    if (ni < 0 || ni >= pages.length) return
    setPages(prev => { const n = [...prev]; const [m] = n.splice(singleSelectedIndex, 1); n.splice(ni, 0, m); return n })
  }
  function rotateSelected() {
    setPages(prev => prev.map(p => selected.has(p.id) ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
  }
  function duplicateSelected() {
    setPages(prev => { const n: PageEntry[] = []; prev.forEach(p => { n.push(p); if (selected.has(p.id)) n.push({ ...p, id: `${p.id}-c${Math.random().toString(36).slice(2, 4)}` }) }); return n })
  }
  function deleteSelected() {
    setPages(prev => prev.filter(p => !selected.has(p.id)))
    setSplitAfter(prev => { const n = new Set(prev); selected.forEach(id => n.delete(id)); return n })
    setSelected(new Set())
  }
  function selectAll() {
    if (mode === 'extract') {
      setSelected(prev => prev.size === pages.length ? new Set() : new Set(pages.map(p => p.id)))
    } else {
      const allButLast = pages.slice(0, -1).map(p => p.id)
      setSplitAfter(prev => prev.size === allButLast.length ? new Set() : new Set(allButLast))
    }
  }
  function reset() { setSplitAfter(new Set()); setSelected(new Set()); setError(null) }

  // ── Ranges computation (0-indexed page arrays for Split; 1-indexed list for Extract) ──

  const splitRanges = useMemo(() => {
    const segs: number[][] = []; let cur: number[] = []
    pages.forEach((p, i) => { cur.push(i); if (splitAfter.has(p.id) || i === pages.length - 1) { segs.push(cur); cur = [] } })
    return segs
  }, [pages, splitAfter])

  // Convert to 1-indexed {from,to} for the action
  const actionRanges = useMemo(
    () => splitRanges.map(seg => ({ from: seg[0] + 1, to: seg[seg.length - 1] + 1 })),
    [splitRanges],
  )

  const primaryDisabled = mode === 'split' ? splitAfter.size === 0 : selected.size === 0

  // ── Submit ──

  const handleAction = async () => {
    if (!file || pages.length === 0) return
    const requestId = crypto.randomUUID()
    const task = 'pdf-split'
    setError(null); setIsProcessing(true)
    if (!await prepareSession(task, requestId)) return

    logEvent('pdf_operation_started', { operation_type: task })
    setButtonLabel(mode === 'split' ? 'Splitting...' : 'Extracting...')

    let ranges: { from: number; to: number }[]
    if (mode === 'split') {
      ranges = actionRanges
    } else {
      // Extract: each selected page is its own range
      ranges = pages
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => selected.has(p.id))
        .map(({ i }) => ({ from: i + 1, to: i + 1 }))
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('ranges', JSON.stringify(ranges))
    formData.append('requestId', requestId)
    formData.append('task', task)
    formData.append('creditCost', String(creditCost))

    try {
      const response = await actions.operations.splitPdf(formData)
      if (response.data?.success) {
        logEvent('pdf_operation_completed', { operation_type: task })
        const token = response.data.data?.claimToken
        if (token) { setClaimToken(token) } else { setDownloadLink(response.data.data?.fileUrl || null) }
      } else {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(response.data?.error || 'Failed to process PDF.')
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel(mode === 'split' ? 'Split' : 'Extract')
      setIsProcessing(false)
    }
  }

  const resetAll = () => {
    setFile(null); setPages([]); setSplitAfter(new Set()); setSelected(new Set())
    setDownloadLink(null); setClaimToken(null); setError(null)
  }

  const goToSignup = () => { if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken); globalThis.location.href = '/signup' }
  const goToSignin = () => { if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken); globalThis.location.href = '/signin' }

  // Estimated thumbnail height for SplitGap alignment (canvas renders async)
  const thumbHeight = Math.round(150 * scale)

  // ── Render ──

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Split PDF</Text>
            <Text size="sm" color="2">Extract pages or split a PDF into multiple files.</Text>
          </Stack>
          <Button href="/dashboard" variant="ghost" size="sm">Back to dashboard</Button>
        </div>

        <Card variant="elevated">
          {/* ── Result states ── */}
          {claimToken ? (
            <Stack gap={4} align="center" style={{ padding: 'var(--th-space-6)', paddingBlock: 'var(--th-space-8)' }}>
              <Callout variant="success" title="Your PDF is ready">
                Create a free account to download it — no credit card required.
              </Callout>
              <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
                <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
              </div>
            </Stack>
          ) : downloadLink ? (
            <Stack gap={4} align="center" style={{ padding: 'var(--th-space-6)', paddingBlock: 'var(--th-space-8)' }}>
              <Callout variant="success" title="Your PDF has been processed">
                {mode === 'split' && splitRanges.length > 1
                  ? `${splitRanges.length} files packaged into a zip.`
                  : 'Your file is ready to download.'}
              </Callout>
              <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
                  {mode === 'split' && splitRanges.length > 1 ? 'Download zip' : 'Download PDF'}
                </Button>
                <Button variant="ghost" onClick={resetAll}>Start over</Button>
              </div>
            </Stack>
          ) : !file ? (
            /* ── Upload ── */
            <div style={{ padding: 'var(--th-space-6)' }}>
              <FileDropzone
                label="Upload PDF"
                hint="Drag and drop or click to browse — one PDF file"
                accept="application/pdf"
                onFiles={handleFiles}
              />
              {error && <div style={{ marginTop: 'var(--th-space-4)' }}><ErrorCallout message={error} /></div>}
            </div>
          ) : (
            /* ── Editor ── */
            <div>
              {/* Top bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '8px',
                padding: '10px 16px 8px',
                background: 'var(--th-color-surface-2)',
                borderBottom: '1px solid var(--th-color-border)',
              }}>
                {/* Mode tabs */}
                <div style={{ display: 'flex', gap: '2px', background: 'var(--th-color-surface-1)', borderRadius: 'var(--th-radius-sm)', padding: '2px' }}>
                  {(['split', 'extract'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); reset() }}
                      style={{
                        border: 'none', cursor: 'pointer',
                        padding: '6px 12px', borderRadius: 'calc(var(--th-radius-sm) - 2px)',
                        fontFamily: 'var(--th-font-display)', fontSize: 'var(--th-text-sm)', fontWeight: 600,
                        color: mode === m ? 'var(--th-color-text-1)' : 'var(--th-color-text-3)',
                        backgroundColor: mode === m ? 'var(--th-color-surface-2)' : 'rgba(0,0,0,0)',
                        boxShadow: mode === m ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all var(--th-duration-base) var(--th-ease-base)',
                      }}
                    >
                      {m === 'split' ? 'Split PDF' : 'Extract Pages'}
                    </button>
                  ))}
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
                  <ToolbarBtn icon={<ChevronLeftIcon />} label="Move left" disabled={singleSelectedIndex <= 0} onClick={() => moveSelected(-1)} />
                  <ToolbarBtn icon={<ChevronRightIcon />} label="Move right" disabled={singleSelectedIndex === -1 || singleSelectedIndex === pages.length - 1} onClick={() => moveSelected(1)} />
                  <div style={{ width: '1px', height: '18px', background: 'var(--th-color-border)', margin: '0 4px' }} />
                  <ToolbarBtn icon={<RotateIcon />} label="Rotate" disabled={selected.size === 0} onClick={rotateSelected} />
                  <ToolbarBtn icon={<CopyIcon />} label="Duplicate" disabled={selected.size === 0} onClick={duplicateSelected} />
                  <ToolbarBtn icon={<TrashIcon />} label="Delete" disabled={selected.size === 0} onClick={deleteSelected} />
                  <div style={{ width: '1px', height: '18px', background: 'var(--th-color-border)', margin: '0 4px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
                    <Text as="span" size="xs" color="3">Zoom</Text>
                    <input
                      type="range" min={60} max={150} value={zoom}
                      onChange={e => setZoom(Number(e.target.value))}
                      aria-label="Zoom"
                      style={{ width: '80px', accentColor: 'var(--th-color-accent)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Hint */}
              <p style={{ margin: 0, padding: '8px 16px', fontSize: 'var(--th-text-xs)', color: 'var(--th-color-text-3)', background: 'var(--th-color-surface-2)', borderBottom: '1px solid var(--th-color-border)' }}>
                {mode === 'split' ? 'Click between pages to mark a split point.' : 'Select the pages you want to extract into a new file.'}
              </p>

              {/* Thumbnail strip */}
              <div style={{ overflowX: 'auto', padding: '28px 24px', background: 'var(--th-color-surface-1)', minHeight: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'max-content' }}>
                  {pages.map((page, i) => (
                    <div key={page.id} style={{ display: 'flex', alignItems: 'center' }}>
                      <PageThumb
                        file={file}
                        pageNumber={i + 1}
                        scale={scale}
                        mode={mode}
                        isSelected={selected.has(page.id)}
                        onToggleSelect={() => toggleSelect(page.id)}
                      />
                      {i < pages.length - 1 && mode === 'split' && (
                        <SplitGap
                          active={splitAfter.has(page.id)}
                          height={thumbHeight}
                          onClick={() => toggleSplit(page.id)}
                        />
                      )}
                      {i < pages.length - 1 && mode === 'extract' && (
                        <div style={{ width: '18px', flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '0 var(--th-space-4) var(--th-space-4)' }}>
                  <ErrorCallout message={error} />
                </div>
              )}

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '8px',
                padding: '10px 16px',
                background: 'var(--th-color-surface-2)',
                borderTop: '1px solid var(--th-color-border)',
              }}>
                <button
                  onClick={selectAll}
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    padding: '4px 0',
                    fontFamily: 'var(--th-font-display)', fontSize: 'var(--th-text-sm)', fontWeight: 600,
                    color: 'var(--th-color-text-2)',
                  }}
                >
                  {mode === 'extract'
                    ? selected.size === pages.length ? 'Deselect all' : 'Select all'
                    : splitAfter.size === pages.length - 1 ? 'Clear split points' : 'Split every page'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Text as="span" size="xs" color="3">
                    {mode === 'split' && splitAfter.size > 0
                      ? `Will create ${splitRanges.length} file${splitRanges.length > 1 ? 's' : ''}`
                      : mode === 'extract' && selected.size > 0
                      ? `${selected.size} page${selected.size > 1 ? 's' : ''} selected`
                      : ''}
                  </Text>
                  <Button variant="ghost" onClick={reset} disabled={splitAfter.size === 0 && selected.size === 0}>
                    Reset
                  </Button>
                  <Button
                    variant="solid-terra"
                    onClick={handleAction}
                    disabled={isProcessing || primaryDisabled}
                  >
                    {isProcessing ? buttonLabel : (mode === 'split' ? 'Split' : 'Extract')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Stack>
    </Container>
  )
}
