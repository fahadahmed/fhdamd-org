'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import {
  Container, Stack, Text, Button, Input, FileDropzone, Callout, Card, Divider,
} from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { logEvent } from '../../../utils/lib/analytics'

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

export default function DecryptPdf({ creditCost }: { creditCost: number }) {
  const [file, setFile]                 = useState<File | null>(null)
  const [password, setPassword]         = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]   = useState('Unlock PDF')

  const handleFiles = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      setDownloadLink(null)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !password) return

    const requestId = crypto.randomUUID()
    const task = 'pdf-decrypt'
    setError(null)
    setButtonLabel('Checking credits...')
    setIsProcessing(true)

    const creditsResponse = await actions.credits.checkCredits({ task, requestId, creditCost })
    if (!creditsResponse.data?.success) {
      setError('Insufficient credits for this operation. Please buy more credits.')
      setButtonLabel('Unlock PDF')
      setIsProcessing(false)
      return
    }

    logEvent('pdf_operation_started', { operation_type: task })
    setButtonLabel('Unlocking...')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)
    formData.append('requestId', requestId)
    formData.append('task', task)
    formData.append('creditCost', String(creditCost))

    try {
      const response = await actions.operations.decryptPdf(formData)
      if (response.data?.success) {
        logEvent('pdf_operation_completed', { operation_type: task })
        setDownloadLink(response.data.data?.fileUrl || null)
      } else {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(response.data?.error || 'Failed to unlock PDF.')
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Unlock PDF')
      setIsProcessing(false)
    }
  }

  const reset = () => { setDownloadLink(null); setFile(null); setPassword(''); setError(null) }

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Unlock PDF</Text>
            <Text size="sm" color="2">Remove password protection from a PDF file.</Text>
          </Stack>
          <Button href="/dashboard" variant="ghost" size="sm">Back to dashboard</Button>
        </div>

        <Card variant="elevated">
          <Stack gap={5} style={{ padding: 'var(--th-space-6)' }}>

            {downloadLink ? (
              <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
                <Callout variant="success" title="Your PDF is unlocked">
                  The password protection has been removed successfully.
                </Callout>
                <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                  <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
                    Download unlocked PDF
                  </Button>
                  <Button variant="ghost" onClick={reset}>Unlock another PDF</Button>
                </div>
              </Stack>
            ) : (
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--th-space-3) var(--th-space-4)',
                      borderRadius: 'var(--th-radius-md)',
                      border: '1px solid var(--th-color-border)',
                      background: 'var(--th-color-surface-2)',
                    }}>
                      <Text size="sm" color="1">{file.name}</Text>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} aria-label="Remove file"><XIcon /></Button>
                    </div>
                  </Stack>
                )}

                {file && (
                  <>
                    <Divider />
                    <form onSubmit={handleSubmit}>
                      <Stack gap={4}>
                        <Input
                          type="password"
                          name="password"
                          id="password"
                          label="PDF password"
                          hint="Enter the password that protects this file"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          autoComplete="current-password"
                          required
                        />
                        {error && <Callout variant="error">{error}</Callout>}
                        <Button
                          type="submit"
                          variant="solid-terra"
                          disabled={isProcessing || !password}
                          style={{ alignSelf: 'flex-start' }}
                        >
                          {buttonLabel}
                        </Button>
                      </Stack>
                    </form>
                  </>
                )}
              </>
            )}

          </Stack>
        </Card>

      </Stack>
    </Container>
  )
}
