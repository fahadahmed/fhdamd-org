'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import {
  Container, Stack, Text, Button, FileDropzone, Callout, Card, Divider, Radio,
} from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { logEvent } from '../../../utils/lib/analytics'
import { buildPrepareSession } from '../../../utils/lib/operationSession'
import { DownloadIcon, ErrorCallout, INSUFFICIENT_CREDITS_ERROR } from '../../shared'

type Quality = 'low' | 'medium' | 'high'

const PRESETS: { value: Quality; label: string; description: string }[] = [
  { value: 'low',    label: 'Maximum compression', description: 'Smallest file — best for screen reading only' },
  { value: 'medium', label: 'Balanced',             description: 'Good size reduction while keeping quality' },
  { value: 'high',   label: 'Best quality',          description: 'Minimal compression — ideal for printing' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function CompressPdf({
  creditCost, isAuthenticated = false,
}: { readonly creditCost: number; readonly isAuthenticated?: boolean }) {
  const [file, setFile]                     = useState<File | null>(null)
  const [quality, setQuality]               = useState<Quality>('medium')
  const [isProcessing, setIsProcessing]     = useState(false)
  const [downloadLink, setDownloadLink]     = useState<string | null>(null)
  const [claimToken, setClaimToken]         = useState<string | null>(null)
  const [alreadyOptimised, setAlreadyOptimised] = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]       = useState('Compress PDF')
  const [originalSize, setOriginalSize]     = useState(0)

  const prepareSession = buildPrepareSession({
    isAuthenticated, creditCost, defaultLabel: 'Compress PDF',
    setButtonLabel, setError: (e) => setError(e), setProcessing: setIsProcessing,
  })

  const handleFiles = (files: File[]) => {
    if (!files.length) return
    setFile(files[0])
    setOriginalSize(files[0].size)
    setDownloadLink(null); setClaimToken(null)
    setAlreadyOptimised(false); setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    const requestId = crypto.randomUUID()
    const task = 'pdf-compress'
    setError(null); setIsProcessing(true)
    if (!await prepareSession(task, requestId)) return

    logEvent('pdf_operation_started', { operation_type: task, quality })
    setButtonLabel('Compressing...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('quality', quality)
    formData.append('requestId', requestId)
    formData.append('task', task)
    formData.append('creditCost', String(creditCost))

    try {
      const response = await actions.operations.compressPdf(formData)
      if (response.data?.success) {
        logEvent('pdf_operation_completed', { operation_type: task })
        setAlreadyOptimised(response.data.data?.alreadyOptimised ?? false)
        const token = response.data.data?.claimToken
        if (token) { setClaimToken(token) } else { setDownloadLink(response.data.data?.fileUrl || null) }
      } else {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(response.data?.error || 'Failed to compress PDF.')
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Compress PDF')
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setFile(null); setDownloadLink(null); setClaimToken(null)
    setAlreadyOptimised(false); setError(null); setOriginalSize(0)
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
        <Callout variant="success" title="Your PDF has been compressed">
          Create a free account to download it — no credit card required.
        </Callout>
        <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
          <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
          <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
        </div>
      </Stack>
    )

    if (downloadLink) {
      const calloutTitle = alreadyOptimised ? 'This PDF is already well-optimised' : 'Compression complete'
      const calloutVariant = alreadyOptimised ? 'info' : 'success'
      return (
        <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
          <Callout variant={calloutVariant} title={calloutTitle}>
            {alreadyOptimised
              ? 'Further compression would not meaningfully reduce the file size. Your original file is returned.'
              : `File size reduced from ${formatBytes(originalSize)}.`}
          </Callout>
          <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
            <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
              Download compressed PDF
            </Button>
            <Button variant="ghost" onClick={reset}>Compress another PDF</Button>
          </div>
        </Stack>
      )
    }

    return (
      <>
        {!file ? (
          <FileDropzone
            label="Upload PDF"
            hint="Drag and drop or click to browse — one PDF file"
            accept="application/pdf"
            onFiles={handleFiles}
          />
        ) : (
          <Stack gap={3}>
            <Text size="sm" color="2" weight={500}>Selected file</Text>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--th-space-3) var(--th-space-4)', borderRadius: 'var(--th-radius-md)', border: '1px solid var(--th-color-border)', background: 'var(--th-color-surface-2)' }}>
              <Text size="sm" color="1">{file.name}</Text>
              <Text size="xs" color="3">{formatBytes(file.size)}</Text>
            </div>
          </Stack>
        )}

        {file && (
          <>
            <Divider />
            <form onSubmit={handleSubmit}>
              <Stack gap={5}>
                <Stack gap={3}>
                  <Text as="h2" size="base" color="1" weight={600}>Quality</Text>
                  <Stack gap={2}>
                    {PRESETS.map((preset) => (
                      <label
                        key={preset.value}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-3)', padding: 'var(--th-space-3) var(--th-space-4)', borderRadius: 'var(--th-radius-md)', border: `1px solid ${quality === preset.value ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`, background: quality === preset.value ? 'var(--th-color-surface-2)' : 'var(--th-color-surface-1)', cursor: 'pointer', transition: 'border-color var(--th-duration-base) var(--th-ease-base)' }}
                      >
                        <Radio
                          name="quality"
                          value={preset.value}
                          checked={quality === preset.value}
                          onChange={() => setQuality(preset.value)}
                          label=""
                        />
                        <Stack gap={0}>
                          <Text as="span" size="sm" color="1" weight={600}>{preset.label}</Text>
                          <Text as="span" size="xs" color="2">{preset.description}</Text>
                        </Stack>
                      </label>
                    ))}
                  </Stack>
                </Stack>

                {error && <ErrorCallout message={error} />}
                <Button type="submit" variant="solid-terra" disabled={isProcessing} style={{ alignSelf: 'flex-start' }}>
                  {buttonLabel}
                </Button>
              </Stack>
            </form>
          </>
        )}
      </>
    )
  }

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Compress PDF</Text>
            <Text size="sm" color="2">Reduce file size with three quality presets. See the before and after size.</Text>
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
