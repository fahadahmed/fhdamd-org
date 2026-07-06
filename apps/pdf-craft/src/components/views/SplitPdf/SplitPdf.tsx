'use client'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { actions } from 'astro:actions'
import { Container, Stack, Text, Button, FileDropzone, Callout, Card } from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { logEvent } from '../../../utils/lib/analytics'
import { buildPrepareSession } from '../../../utils/lib/operationSession'
import { getPdfPageCount, renderPdfPageToCanvas } from '../../../utils/lib/pdfRender'
import { DownloadIcon, ErrorCallout } from '../../shared'

// ── Icons ─────────────────────────────────────────────────────────────────────

const ICON_SZ = { width: 16, height: 16, display: 'block' }

function ChevronLeftIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={ICON_SZ}><polyline points="15 18 9 12 15 6" /></svg>
}
function ChevronRightIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={ICON_SZ}><polyline points="9 18 15 12 9 6" /></svg>
}
function RotateIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={ICON_SZ}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
}
function CopyIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={ICON_SZ}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={ICON_SZ}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
}
function ScissorsIcon({ size = 12 }: { readonly size?: number }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: size, height: size, display: 'block' }}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 10, height: 10, display: 'block' }}><polyline points="20 6 9 17 4 12" /></svg>
}

// ── Toolbar icon button ───────────────────────────────────────────────────────

interface ToolbarBtnProps {
  readonly icon: React.ReactNode
  readonly label: string
  readonly disabled?: boolean
  readonly onClick: () => void
}

function ToolbarBtn({ icon, label, disabled, onClick }: ToolbarBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '6px', borderRadius: 'var(--th-radius-sm)', display: 'inline-flex',
        color: 'var(--th-color-text-2)', opacity: disabled ? 0.4 : 1,
        backgroundColor: 'transparent',
        transition: 'background-color var(--th-duration-base) var(--th-ease-base)',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--th-color-surface-2)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
    >
      {icon}
    </button>
  )
}

// ── Page thumbnail (lazy canvas via IntersectionObserver) ─────────────────────

interface PageThumbProps {
  readonly file: File
  readonly pageNumber: number
  readonly scale: number
  readonly mode: 'split' | 'extract'
  readonly isSelected: boolean
  readonly onToggleSelect: () => void
}

function PageThumb({ file, pageNumber, scale, mode, isSelected, onToggleSelect }: PageThumbProps) {
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

  const borderColor = isSelected ? 'var(--th-color-accent)' : 'transparent'
  const boxShadow = isSelected ? '0 0 0 2px var(--th-color-accent)' : 'none'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '0 4px', flexShrink: 0 }}>
      <button
        onClick={onToggleSelect}
        style={{
          position: 'relative', display: 'inline-flex', padding: '4px',
          border: 'none', borderRadius: 'var(--th-radius-sm)',
          cursor: 'pointer', backgroundColor: 'transparent',
          boxShadow, borderColor,
          transition: 'box-shadow var(--th-duration-base) var(--th-ease-base)',
        }}
      >
        {mode === 'extract' && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            width: '16px', height: '16px', borderRadius: '3px',
            border: `1px solid ${isSelected ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
            backgroundColor: isSelected ? 'var(--th-color-accent)' : 'var(--th-color-surface-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            {isSelected && <CheckIcon />}
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'block', border: '1px solid var(--th-color-border)', borderRadius: '3px', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }} />
      </button>
      <Text as="span" size="xs" color="3">{pageNumber}</Text>
    </div>
  )
}

// ── Split gap (scissors button between pages) ─────────────────────────────────

interface SplitGapProps {
  readonly active: boolean
  readonly height: number
  readonly onClick: () => void
}

function SplitGap({ active, height, onClick }: SplitGapProps) {
  const [hovered, setHovered] = useState(false)
  const show = active || hovered
  const lineColor = show ? 'var(--th-color-accent)' : 'var(--th-color-border)'
  const lineStyle = show ? 'solid' : 'dashed'
  const btnBg = active ? 'var(--th-color-accent)' : 'var(--th-color-surface-1)'
  const btnColor = active ? '#fff' : hovered ? 'var(--th-color-accent)' : 'var(--th-color-text-3)'
  const btnBorder = active || hovered ? 'var(--th-color-accent)' : 'var(--th-color-border)'

  return (
    <button
      onClick={onClick}
      aria-label={active ? 'Remove split point' : 'Add split point'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', width: '36px', flexShrink: 0, height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', border: 'none', backgroundColor: 'transparent', padding: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', borderLeft: `1.5px ${lineStyle} ${lineColor}`, opacity: show ? 1 : 0.6, transition: 'all var(--th-duration-base) var(--th-ease-base)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '26px', height: '26px', borderRadius: '50%', border: `1px solid ${btnBorder}`, backgroundColor: btnBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: btnColor, boxShadow: hovered && !active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all var(--th-duration-base) var(--th-ease-base)' }}>
        <ScissorsIcon size={13} />
      </div>
      {hovered && !active && (
        <div style={{ position: 'absolute', top: '-34px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', backgroundColor: 'var(--th-color-text-1)', color: 'var(--th-color-surface-1)', fontSize: 'var(--th-text-xs)', padding: '4px 8px', borderRadius: 'var(--th-radius-sm)', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          Click to split here
        </div>
      )}
    </button>
  )
}

// ── Page entry type ───────────────────────────────────────────────────────────

interface PageEntry { readonly id: string; rotation: number }

// Use crypto.randomUUID for non-security UI IDs
function makePages(n: number): PageEntry[] {
  return Array.from({ length: n }, () => ({ id: crypto.randomUUID(), rotation: 0 }))
}

// ── usePageOperations — encapsulates all per-page state and mutations ──────────

function usePageOperations(initialPages: PageEntry[] = []) {
  const [pages, setPages] = useState<PageEntry[]>(initialPages)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const singleSelectedIndex = useMemo(() => {
    if (selected.size !== 1) return -1
    return pages.findIndex(p => p.id === [...selected][0])
  }, [selected, pages])

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }, [])

  const moveSelected = useCallback((dir: -1 | 1) => {
    setPages(prev => {
      const idx = prev.findIndex(p => selected.has(p.id))
      const ni = idx + dir
      if (idx === -1 || ni < 0 || ni >= prev.length) return prev
      const next = [...prev]; const [m] = next.splice(idx, 1); next.splice(ni, 0, m); return next
    })
  }, [selected])

  const rotateSelected = useCallback(() => {
    setPages(prev => prev.map(p => selected.has(p.id) ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
  }, [selected])

  const duplicateSelected = useCallback(() => {
    setPages(prev => {
      const next: PageEntry[] = []
      prev.forEach(p => { next.push(p); if (selected.has(p.id)) next.push({ ...p, id: crypto.randomUUID() }) })
      return next
    })
  }, [selected])

  const deleteSelected = useCallback((onSplitClean: (ids: Set<string>) => void) => {
    onSplitClean(selected)
    setPages(prev => prev.filter(p => !selected.has(p.id)))
    setSelected(new Set())
  }, [selected])

  const selectAll = useCallback((allSelected: boolean) => {
    setSelected(allSelected ? new Set() : new Set(pages.map(p => p.id)))
  }, [pages])

  const reset = useCallback(() => setSelected(new Set()), [])

  return { pages, setPages, selected, setSelected, singleSelectedIndex, toggleSelect, moveSelected, rotateSelected, duplicateSelected, deleteSelected, selectAll, reset }
}

// ── useSplitPoints — split-after-page tracking and range computation ──────────

function useSplitPoints(pages: PageEntry[]) {
  const [splitAfter, setSplitAfter] = useState<Set<string>>(new Set())

  const toggleSplit = useCallback((id: string) => {
    setSplitAfter(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }, [])

  const splitRanges = useMemo(() => {
    const segs: number[][] = []; let cur: number[] = []
    pages.forEach((p, i) => { cur.push(i); if (splitAfter.has(p.id) || i === pages.length - 1) { segs.push(cur); cur = [] } })
    return segs
  }, [pages, splitAfter])

  const actionRanges = useMemo(
    () => splitRanges.map(seg => ({ from: seg[0] + 1, to: seg[seg.length - 1] + 1 })),
    [splitRanges],
  )

  const splitEveryPage = useCallback(() => {
    setSplitAfter(new Set(pages.slice(0, -1).map(p => p.id)))
  }, [pages])

  const clearSplits = useCallback(() => setSplitAfter(new Set()), [])

  const cleanSplitsForDeleted = useCallback((ids: Set<string>) => {
    setSplitAfter(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n })
  }, [])

  return { splitAfter, setSplitAfter, toggleSplit, splitRanges, actionRanges, splitEveryPage, clearSplits, cleanSplitsForDeleted }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SplitPdf({
  creditCost, isAuthenticated = false,
}: { readonly creditCost: number; readonly isAuthenticated?: boolean }) {
  const [file, setFile]                 = useState<File | null>(null)
  const [mode, setMode]                 = useState<'split' | 'extract'>('split')
  const [zoom, setZoom]                 = useState(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [claimToken, setClaimToken]     = useState<string | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]   = useState('Split')

  const ops = usePageOperations()
  const splits = useSplitPoints(ops.pages)

  const scale = zoom / 100 * 0.22

  const prepareSession = buildPrepareSession({
    isAuthenticated, creditCost, defaultLabel: 'Split',
    setButtonLabel, setError: (e) => setError(e), setProcessing: setIsProcessing,
  })

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    const f = files[0]
    setFile(f); setDownloadLink(null); setClaimToken(null); setError(null)
    splits.clearSplits(); ops.reset()
    try {
      const count = await getPdfPageCount(f)
      ops.setPages(makePages(count))
    } catch (err) {
      console.error('[SplitPdf] getPdfPageCount failed:', err)
      setError('Could not read the PDF. Make sure it is a valid, unencrypted file.')
      setFile(null)
    }
  }, [ops, splits])

  const switchMode = (m: 'split' | 'extract') => { setMode(m); splits.clearSplits(); ops.reset(); setError(null) }

  const selectAllToggle = () => {
    const isAllSelected = ops.selected.size === ops.pages.length
    if (mode === 'extract') { ops.selectAll(isAllSelected) } else { isAllSelected ? splits.clearSplits() : splits.splitEveryPage() }
  }

  const primaryDisabled = mode === 'split' ? splits.splitAfter.size === 0 : ops.selected.size === 0

  const handleAction = async () => {
    if (!file || ops.pages.length === 0) return
    const requestId = crypto.randomUUID()
    const task = 'pdf-split'
    setError(null); setIsProcessing(true)
    if (!await prepareSession(task, requestId)) return

    logEvent('pdf_operation_started', { operation_type: task })
    setButtonLabel(mode === 'split' ? 'Splitting...' : 'Extracting...')

    const ranges = mode === 'split'
      ? splits.actionRanges
      : ops.pages.filter(p => ops.selected.has(p.id)).map((_, i) => ({ from: i + 1, to: i + 1 }))

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
    setFile(null); ops.setPages([]); splits.clearSplits(); ops.reset()
    setDownloadLink(null); setClaimToken(null); setError(null)
  }

  const goToSignup = () => { if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken); globalThis.location.href = '/signup' }
  const goToSignin = () => { if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken); globalThis.location.href = '/signin' }

  const thumbHeight = Math.round(150 * scale)

  // ── Footer label helpers ──
  const allSplitActive = splits.splitAfter.size === ops.pages.length - 1
  const allExtractActive = ops.selected.size === ops.pages.length
  const footerLinkLabel = mode === 'extract'
    ? (allExtractActive ? 'Deselect all' : 'Select all')
    : (allSplitActive ? 'Clear split points' : 'Split every page')

  const fileCount = splits.splitRanges.length
  const footerHelper = mode === 'split' && splits.splitAfter.size > 0
    ? `Will create ${fileCount} file${fileCount > 1 ? 's' : ''}`
    : mode === 'extract' && ops.selected.size > 0
    ? `${ops.selected.size} page${ops.selected.size > 1 ? 's' : ''} selected`
    : ''

  const primaryLabel = isProcessing ? buttonLabel : (mode === 'split' ? 'Split' : 'Extract')

  // ── Download label ──
  const downloadLabel = mode === 'split' && splits.splitRanges.length > 1 ? 'Download zip' : 'Download PDF'

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
          {claimToken && (
            <Stack gap={4} align="center" style={{ padding: 'var(--th-space-6)', paddingBlock: 'var(--th-space-8)' }}>
              <Callout variant="success" title="Your PDF is ready">
                Create a free account to download it — no credit card required.
              </Callout>
              <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
                <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
              </div>
            </Stack>
          )}
          {!claimToken && downloadLink && (
            <Stack gap={4} align="center" style={{ padding: 'var(--th-space-6)', paddingBlock: 'var(--th-space-8)' }}>
              <Callout variant="success" title="Your PDF has been processed">
                {downloadLabel === 'Download zip' ? `${splits.splitRanges.length} files packaged into a zip.` : 'Your file is ready to download.'}
              </Callout>
              <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>{downloadLabel}</Button>
                <Button variant="ghost" onClick={resetAll}>Start over</Button>
              </div>
            </Stack>
          )}
          {!claimToken && !downloadLink && !file && (
            <div style={{ padding: 'var(--th-space-6)' }}>
              <FileDropzone label="Upload PDF" hint="Drag and drop or click to browse — one PDF file" accept="application/pdf" onFiles={handleFiles} />
              {error && <div style={{ marginTop: 'var(--th-space-4)' }}><ErrorCallout message={error} /></div>}
            </div>
          )}
          {!claimToken && !downloadLink && file && (
            <div>
              {/* Top bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '10px 16px 8px', backgroundColor: 'var(--th-color-surface-2)', borderBottom: '1px solid var(--th-color-border)' }}>
                <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--th-color-surface-1)', borderRadius: 'var(--th-radius-sm)', padding: '2px' }}>
                  {(['split', 'extract'] as const).map(m => (
                    <button key={m} onClick={() => switchMode(m)} style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 'calc(var(--th-radius-sm) - 2px)', fontFamily: 'var(--th-font-display)', fontSize: 'var(--th-text-sm)', fontWeight: 600, color: mode === m ? 'var(--th-color-text-1)' : 'var(--th-color-text-3)', backgroundColor: mode === m ? 'var(--th-color-surface-2)' : 'rgba(0,0,0,0)', boxShadow: mode === m ? '0 1px 2px rgba(0,0,0,0.08)' : 'none', transition: 'all var(--th-duration-base) var(--th-ease-base)' }}>
                      {m === 'split' ? 'Split PDF' : 'Extract Pages'}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
                  <ToolbarBtn icon={<ChevronLeftIcon />} label="Move left" disabled={ops.singleSelectedIndex <= 0} onClick={() => ops.moveSelected(-1)} />
                  <ToolbarBtn icon={<ChevronRightIcon />} label="Move right" disabled={ops.singleSelectedIndex === -1 || ops.singleSelectedIndex === ops.pages.length - 1} onClick={() => ops.moveSelected(1)} />
                  <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--th-color-border)', margin: '0 4px' }} />
                  <ToolbarBtn icon={<RotateIcon />} label="Rotate" disabled={ops.selected.size === 0} onClick={ops.rotateSelected} />
                  <ToolbarBtn icon={<CopyIcon />} label="Duplicate" disabled={ops.selected.size === 0} onClick={ops.duplicateSelected} />
                  <ToolbarBtn icon={<TrashIcon />} label="Delete" disabled={ops.selected.size === 0} onClick={() => ops.deleteSelected(splits.cleanSplitsForDeleted)} />
                  <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--th-color-border)', margin: '0 4px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
                    <Text as="span" size="xs" color="3">Zoom</Text>
                    <input type="range" min={60} max={150} value={zoom} onChange={e => setZoom(Number(e.target.value))} aria-label="Zoom" style={{ width: '80px', accentColor: 'var(--th-color-accent)' }} />
                  </div>
                </div>
              </div>

              <p style={{ margin: 0, padding: '8px 16px', fontSize: 'var(--th-text-xs)', color: 'var(--th-color-text-3)', backgroundColor: 'var(--th-color-surface-2)', borderBottom: '1px solid var(--th-color-border)' }}>
                {mode === 'split' ? 'Click between pages to mark a split point.' : 'Select the pages you want to extract into a new file.'}
              </p>

              <div style={{ overflowX: 'auto', padding: '28px 24px', backgroundColor: 'var(--th-color-surface-1)', minHeight: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'max-content' }}>
                  {ops.pages.map((page, i) => (
                    <div key={page.id} style={{ display: 'flex', alignItems: 'center' }}>
                      <PageThumb file={file} pageNumber={i + 1} scale={scale} mode={mode} isSelected={ops.selected.has(page.id)} onToggleSelect={() => ops.toggleSelect(page.id)} />
                      {i < ops.pages.length - 1 && mode === 'split' && <SplitGap active={splits.splitAfter.has(page.id)} height={thumbHeight} onClick={() => splits.toggleSplit(page.id)} />}
                      {i < ops.pages.length - 1 && mode === 'extract' && <div style={{ width: '18px', flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
              </div>

              {error && <div style={{ padding: '0 var(--th-space-4) var(--th-space-4)' }}><ErrorCallout message={error} /></div>}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--th-color-surface-2)', borderTop: '1px solid var(--th-color-border)' }}>
                <button onClick={selectAllToggle} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--th-font-display)', fontSize: 'var(--th-text-sm)', fontWeight: 600, color: 'var(--th-color-text-2)' }}>
                  {footerLinkLabel}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Text as="span" size="xs" color="3">{footerHelper}</Text>
                  <Button variant="ghost" onClick={() => { splits.clearSplits(); ops.reset() }} disabled={splits.splitAfter.size === 0 && ops.selected.size === 0}>Reset</Button>
                  <Button variant="solid-terra" onClick={handleAction} disabled={isProcessing || primaryDisabled}>{primaryLabel}</Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Stack>
    </Container>
  )
}
