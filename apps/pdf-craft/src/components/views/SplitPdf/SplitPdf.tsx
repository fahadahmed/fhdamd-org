'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { actions } from 'astro:actions'
import {
  Container, Stack, Text, Button, FileDropzone, Callout, Card,
} from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { logEvent } from '../../../utils/lib/analytics'
import { buildPrepareSession } from '../../../utils/lib/operationSession'
import { getPdfPageCount, renderPdfPageToCanvas } from '../../../utils/lib/pdfRender'
import { DownloadIcon, ErrorCallout } from '../../shared'

// ── Icons ─────────────────────────────────────────────────────────────────────

function ScissorsIcon({ size = 16 }: { readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

// ── PageThumb — lazy canvas render via IntersectionObserver ───────────────────

interface PageThumbProps {
  readonly file: File
  readonly pageNumber: number
  readonly scale: number
}

function PageThumb({ file, pageNumber, scale }: PageThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !rendered) {
          setRendered(true)
          renderPdfPageToCanvas(file, pageNumber, canvas, scale).catch(() => {})
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [file, pageNumber, scale, rendered])

  // Reset rendered state when scale changes so the canvas re-renders at new size
  useEffect(() => { setRendered(false) }, [scale])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        border: '1px solid var(--th-color-border)',
        borderRadius: 'var(--th-radius-sm)',
        background: '#fff',
        maxWidth: '100%',
      }}
    />
  )
}

// ── SplitPoint — the scissors button + dashed line between pages ──────────────

interface SplitPointProps {
  readonly active: boolean
  readonly onClick: () => void
}

function SplitPoint({ active, onClick }: SplitPointProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{
        flex: 1,
        width: '2px',
        borderLeft: `2px ${active ? 'solid' : 'dashed'} ${active ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
        minHeight: '20px',
      }} />
      <button
        onClick={onClick}
        title={active ? 'Remove split point' : 'Add split point'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: `1px solid ${active ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
          background: active ? 'var(--th-color-accent)' : 'var(--th-color-surface-1)',
          color: active ? '#fff' : 'var(--th-color-text-3)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all var(--th-duration-base) var(--th-ease-base)',
        }}
      >
        <ScissorsIcon size={14} />
      </button>
      <div style={{
        flex: 1,
        width: '2px',
        borderLeft: `2px ${active ? 'solid' : 'dashed'} ${active ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
        minHeight: '20px',
      }} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SplitPdf({
  creditCost, isAuthenticated = false,
}: { readonly creditCost: number; readonly isAuthenticated?: boolean }) {
  const [file, setFile]                 = useState<File | null>(null)
  const [pageCount, setPageCount]       = useState(0)
  const [splitPoints, setSplitPoints]   = useState<Set<number>>(new Set())
  const [zoom, setZoom]                 = useState(0.22) // canvas scale factor
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [claimToken, setClaimToken]     = useState<string | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]   = useState('Split')

  const prepareSession = buildPrepareSession({
    isAuthenticated, creditCost, defaultLabel: 'Split',
    setButtonLabel, setError: (e) => setError(e), setProcessing: setIsProcessing,
  })

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    const f = files[0]
    setFile(f)
    setDownloadLink(null)
    setClaimToken(null)
    setError(null)
    setSplitPoints(new Set())
    try {
      const count = await getPdfPageCount(f)
      setPageCount(count)
    } catch (err) {
      console.error('[SplitPdf] getPdfPageCount failed:', err)
      setError('Could not read the PDF. Make sure it is a valid, unencrypted file.')
      setFile(null)
    }
  }, [])

  const toggleSplitPoint = (afterPage: number) => {
    setSplitPoints(prev => {
      const next = new Set(prev)
      if (next.has(afterPage)) { next.delete(afterPage) } else { next.add(afterPage) }
      return next
    })
  }

  const splitEveryPage = () =>
    setSplitPoints(new Set(Array.from({ length: pageCount - 1 }, (_, i) => i + 1)))

  const resetSplitPoints = () => setSplitPoints(new Set())

  // Convert split points into {from, to}[] ranges
  const getRanges = () => {
    const points = [...splitPoints].sort((a, b) => a - b)
    const ranges: { from: number; to: number }[] = []
    let from = 1
    for (const p of points) { ranges.push({ from, to: p }); from = p + 1 }
    ranges.push({ from, to: pageCount })
    return ranges
  }

  const handleSplit = async () => {
    if (!file || pageCount === 0) return
    const ranges = getRanges()
    if (ranges.length === 1 && splitPoints.size === 0) {
      setError('Add at least one split point by clicking the scissors icon between pages.')
      return
    }

    const requestId = crypto.randomUUID()
    const task = 'pdf-split'
    setError(null)
    setIsProcessing(true)

    if (!await prepareSession(task, requestId)) return

    logEvent('pdf_operation_started', { operation_type: task, split_count: splitPoints.size })
    setButtonLabel('Splitting...')

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
        setError(response.data?.error || 'Failed to split PDF.')
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Split')
      setIsProcessing(false)
    }
  }

  const resetAll = () => {
    setFile(null); setPageCount(0); setSplitPoints(new Set())
    setDownloadLink(null); setClaimToken(null); setError(null)
  }

  const goToSignup = () => {
    if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken)
    globalThis.location.href = '/signup'
  }

  const goToSignin = () => {
    if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken)
    globalThis.location.href = '/signin'
  }

  const rangeCount = getRanges().length

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Split PDF</Text>
            <Text size="sm" color="2">Click the scissors between pages to mark split points.</Text>
          </Stack>
          <Button href="/dashboard" variant="ghost" size="sm">Back to dashboard</Button>
        </div>

        <Card variant="elevated">
          {/* ── Result states ── */}
          {claimToken ? (
            <Stack gap={4} align="center" style={{ padding: 'var(--th-space-6)', paddingBlock: 'var(--th-space-8)' }}>
              <Callout variant="success" title="Your PDF has been split">
                Create a free account to download it — no credit card required.
              </Callout>
              <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
                <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
              </div>
            </Stack>
          ) : downloadLink ? (
            <Stack gap={4} align="center" style={{ padding: 'var(--th-space-6)', paddingBlock: 'var(--th-space-8)' }}>
              <Callout variant="success" title="Your PDF has been split">
                {rangeCount > 1 ? `${rangeCount} files packaged into a zip.` : 'Your extracted pages are ready.'}
              </Callout>
              <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
                  {rangeCount > 1 ? 'Download zip' : 'Download PDF'}
                </Button>
                <Button variant="ghost" onClick={resetAll}>Split another PDF</Button>
              </div>
            </Stack>
          ) : !file ? (
            /* ── Upload state ── */
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
            /* ── Split editor ── */
            <Stack gap={0}>
              {/* Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--th-space-3) var(--th-space-4)',
                borderBottom: '1px solid var(--th-color-border)',
                gap: 'var(--th-space-3)',
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-3)' }}>
                  <Text size="sm" color="2">
                    {file.name} · {pageCount} page{pageCount === 1 ? '' : 's'}
                  </Text>
                  {splitPoints.size > 0 && (
                    <Text size="xs" color="3">
                      → {splitPoints.size + 1} part{splitPoints.size > 0 ? 's' : ''}
                    </Text>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-2)' }}>
                    <Text size="xs" color="3">Zoom</Text>
                    <input
                      type="range"
                      min={0.12}
                      max={0.4}
                      step={0.02}
                      value={zoom}
                      onChange={e => setZoom(Number(e.target.value))}
                      style={{ width: '80px', accentColor: 'var(--th-color-accent)' }}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={resetAll}>
                    ✕ Close
                  </Button>
                </div>
              </div>

              {/* Instruction */}
              <div style={{ padding: 'var(--th-space-3) var(--th-space-4)', borderBottom: '1px solid var(--th-color-border)' }}>
                <Text size="xs" color="3">Click between pages to mark a split point.</Text>
              </div>

              {/* Page strip */}
              <div style={{
                overflowX: 'auto',
                padding: 'var(--th-space-5) var(--th-space-4)',
                display: 'flex',
                alignItems: 'stretch',
                gap: 0,
                minHeight: '160px',
              }}>
                {Array.from({ length: pageCount }, (_, i) => {
                  const pageNum = i + 1
                  const isSplit = splitPoints.has(pageNum)
                  return (
                    <div key={pageNum} style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
                      {/* Page thumbnail + label */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--th-space-2)' }}>
                        <PageThumb file={file} pageNumber={pageNum} scale={zoom} />
                        <Text size="xs" color="3">{pageNum}</Text>
                      </div>

                      {/* Split point between pages (not after the last) */}
                      {pageNum < pageCount && (
                        <SplitPoint
                          active={isSplit}
                          onClick={() => toggleSplitPoint(pageNum)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '0 var(--th-space-4) var(--th-space-4)' }}>
                  <ErrorCallout message={error} />
                </div>
              )}

              {/* Bottom toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--th-space-3) var(--th-space-4)',
                borderTop: '1px solid var(--th-color-border)',
                flexWrap: 'wrap',
                gap: 'var(--th-space-3)',
              }}>
                <button
                  onClick={splitEveryPage}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'var(--th-font-display)',
                    fontSize: 'var(--th-text-sm)',
                    fontWeight: 600,
                    color: 'var(--th-color-accent-text)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  Split every page
                </button>
                <div style={{ display: 'flex', gap: 'var(--th-space-3)' }}>
                  <Button type="button" variant="ghost" onClick={resetSplitPoints} disabled={splitPoints.size === 0}>
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="solid-terra"
                    onClick={handleSplit}
                    disabled={isProcessing || splitPoints.size === 0}
                  >
                    {buttonLabel}
                  </Button>
                </div>
              </div>
            </Stack>
          )}
        </Card>
      </Stack>
    </Container>
  )
}
