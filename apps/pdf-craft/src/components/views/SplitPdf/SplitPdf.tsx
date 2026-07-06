'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { actions } from 'astro:actions'
import {
  Container, Stack, Text, Button, FileDropzone, Callout, Card, Divider, Input,
} from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { logEvent } from '../../../utils/lib/analytics'
import { buildPrepareSession } from '../../../utils/lib/operationSession'
import { getPdfPageCount, renderPdfPageToCanvas } from '../../../utils/lib/pdfRender'
import { DownloadIcon, ErrorCallout, INSUFFICIENT_CREDITS_ERROR } from '../../shared'

interface Range { from: number; to: number }

interface PageThumbProps {
  readonly file: File
  readonly pageNumber: number
}

function PageThumb({ file, pageNumber }: PageThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !rendered) {
          setRendered(true)
          renderPdfPageToCanvas(file, pageNumber, canvas, 0.3).catch(() => {})
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [file, pageNumber, rendered])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid var(--th-color-border)',
          borderRadius: 'var(--th-radius-sm)',
          maxWidth: '80px',
        }}
      />
      <Text size="xs" color="3">{pageNumber}</Text>
    </div>
  )
}

export default function SplitPdf({ creditCost, isAuthenticated = false }: { readonly creditCost: number; readonly isAuthenticated?: boolean }) {
  const [file, setFile]               = useState<File | null>(null)
  const [pageCount, setPageCount]     = useState(0)
  const [ranges, setRanges]           = useState<Range[]>([{ from: 1, to: 1 }])
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [claimToken, setClaimToken]   = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [buttonLabel, setButtonLabel] = useState('Split PDF')

  const prepareSession = buildPrepareSession({
    isAuthenticated, creditCost, defaultLabel: 'Split PDF',
    setButtonLabel, setError: (e) => setError(e), setProcessing: setIsProcessing,
  })

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    const f = files[0]
    setFile(f)
    setDownloadLink(null)
    setClaimToken(null)
    setError(null)
    try {
      const count = await getPdfPageCount(f)
      setPageCount(count)
      setRanges([{ from: 1, to: count }])
    } catch (err) {
      console.error('[SplitPdf] getPdfPageCount failed:', err)
      setError('Could not read the PDF. Make sure it is a valid, unencrypted file.')
      setFile(null)
    }
  }, [])

  const updateRange = (index: number, field: 'from' | 'to', raw: string) => {
    const val = parseInt(raw, 10)
    if (isNaN(val)) return
    setRanges(prev => prev.map((r, i) => i === index ? { ...r, [field]: val } : r))
  }

  const addRange = () => setRanges(prev => [...prev, { from: 1, to: pageCount }])

  const removeRange = (index: number) =>
    setRanges(prev => prev.filter((_, i) => i !== index))

  const validateRanges = (): string | null => {
    for (const r of ranges) {
      if (r.from < 1 || r.to > pageCount || r.from > r.to) {
        return `Range ${r.from}–${r.to} is invalid. Pages must be between 1 and ${pageCount}, and from ≤ to.`
      }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    const validationError = validateRanges()
    if (validationError) { setError(validationError); return }

    const requestId = crypto.randomUUID()
    const task = 'pdf-split'
    setError(null)
    setIsProcessing(true)

    if (!await prepareSession(task, requestId)) return

    logEvent('pdf_operation_started', { operation_type: task, range_count: ranges.length })
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
        if (token) {
          setClaimToken(token)
        } else {
          setDownloadLink(response.data.data?.fileUrl || null)
        }
      } else {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(response.data?.error || 'Failed to split PDF.')
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Split PDF')
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setFile(null); setPageCount(0); setRanges([{ from: 1, to: 1 }])
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

  const renderContent = () => {
    if (claimToken) return (
      <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
        <Callout variant="success" title="Your PDF has been split">
          Create a free account to download it — no credit card required.
        </Callout>
        <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
          <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
          <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
        </div>
      </Stack>
    )
    if (downloadLink) return (
      <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
        <Callout variant="success" title="Your PDF has been split">
          {ranges.length === 1 ? 'Your extracted pages are ready.' : `${ranges.length} page ranges have been packaged into a zip file.`}
        </Callout>
        <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
          <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
            {ranges.length === 1 ? 'Download PDF' : 'Download zip'}
          </Button>
          <Button variant="ghost" onClick={reset}>Split another PDF</Button>
        </div>
      </Stack>
    )
    return (
      <>
        {!file ? (
          <>
            <FileDropzone
              label="Upload PDF"
              hint="Drag and drop or click to browse — one PDF file"
              accept="application/pdf"
              onFiles={handleFiles}
            />
            {error && <ErrorCallout message={error} />}
          </>
        ) : (
          <Stack gap={5}>
            <Stack gap={2}>
              <Text size="sm" color="2" weight={500}>Selected file</Text>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--th-space-3) var(--th-space-4)',
                borderRadius: 'var(--th-radius-md)',
                border: '1px solid var(--th-color-border)',
                background: 'var(--th-color-surface-2)',
              }}>
                <Text size="sm" color="1">{file.name}</Text>
                <Text size="xs" color="3">{pageCount} page{pageCount === 1 ? '' : 's'}</Text>
              </div>
            </Stack>

            {pageCount > 0 && (
              <Stack gap={2}>
                <Text size="sm" color="2" weight={500}>Page preview</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--th-space-2)', overflowX: 'auto' }}>
                  {Array.from({ length: Math.min(pageCount, 20) }, (_, i) => (
                    <PageThumb key={i + 1} file={file} pageNumber={i + 1} />
                  ))}
                  {pageCount > 20 && (
                    <Text size="xs" color="3" style={{ alignSelf: 'center' }}>+{pageCount - 20} more</Text>
                  )}
                </div>
              </Stack>
            )}

            <Divider />

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Stack gap={3}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text as="h2" size="base" color="1" weight={600}>Page ranges</Text>
                    {ranges.length < 20 && (
                      <Button type="button" variant="ghost" size="sm" onClick={addRange}>
                        + Add range
                      </Button>
                    )}
                  </div>

                  {ranges.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-3)' }}>
                      <div style={{ flex: 1 }}>
                        <Input
                          type="number"
                          id={`range-${i}-from`}
                          label="From page"
                          value={String(r.from)}
                          min={1}
                          max={pageCount}
                          onChange={e => updateRange(i, 'from', e.target.value)}
                          required
                        />
                      </div>
                      <Text size="sm" color="3" style={{ paddingTop: 'var(--th-space-5)' }}>to</Text>
                      <div style={{ flex: 1 }}>
                        <Input
                          type="number"
                          id={`range-${i}-to`}
                          label="To page"
                          value={String(r.to)}
                          min={1}
                          max={pageCount}
                          onChange={e => updateRange(i, 'to', e.target.value)}
                          required
                        />
                      </div>
                      {ranges.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRange(i)}
                          style={{ paddingTop: 'var(--th-space-5)' }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}

                  <Text size="xs" color="3">
                    {ranges.length === 1
                      ? 'Single range → one PDF file.'
                      : `${ranges.length} ranges → zip file with ${ranges.length} PDFs.`}
                  </Text>
                </Stack>

                {error && <ErrorCallout message={error} />}

                <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                  <Button type="submit" variant="solid-terra" disabled={isProcessing || !file}>
                    {buttonLabel}
                  </Button>
                  <Button type="button" variant="ghost" onClick={reset}>
                    Choose different file
                  </Button>
                </div>
              </Stack>
            </form>
          </Stack>
        )}
      </>
    )
  }

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Split PDF</Text>
            <Text size="sm" color="2">Extract page ranges into separate files. One range gives a PDF; multiple ranges give a zip.</Text>
          </Stack>
          <Button href="/dashboard" variant="ghost" size="sm">Back to dashboard</Button>
        </div>
        <Card variant="elevated">
          <Stack gap={5} style={{ padding: 'var(--th-space-6)' }}>
            {renderContent()}
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
