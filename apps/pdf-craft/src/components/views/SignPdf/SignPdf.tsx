'use client'
import { useState, useCallback } from 'react'
import { actions } from 'astro:actions'
import { Container, Stack, Text, Button, FileDropzone, Callout, Card } from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { logEvent } from '../../../utils/lib/analytics'
import { buildPrepareSession } from '../../../utils/lib/operationSession'
import { getPdfPageCount, getPdfPageDimensions } from '../../../utils/lib/pdfRender'
import { DownloadIcon, ErrorCallout } from '../../shared'
import SignatureModal, { type SignatureOutput } from './SignatureModal'
import SignaturePlacement, { type Placement } from './SignaturePlacement'

type Step = 'upload' | 'modal' | 'placement' | 'result'

export default function SignPdf({
  creditCost, isAuthenticated = false,
}: { readonly creditCost: number; readonly isAuthenticated?: boolean }) {
  const [step, setStep]                   = useState<Step>('upload')
  const [file, setFile]                   = useState<File | null>(null)
  const [pageDimensions, setPageDimensions] = useState<Array<{ width: number; height: number }>>([])
  const [signature, setSignature]         = useState<SignatureOutput | null>(null)
  const [downloadLink, setDownloadLink]   = useState<string | null>(null)
  const [claimToken, setClaimToken]       = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [isProcessing, setIsProcessing]   = useState(false)
  const [buttonLabel, setButtonLabel]     = useState('Sign PDF')

  const prepareSession = buildPrepareSession({
    isAuthenticated, creditCost, defaultLabel: 'Sign PDF',
    setButtonLabel, setError: (e) => setError(e), setProcessing: setIsProcessing,
  })

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    const f = files[0]
    setFile(f); setError(null)
    try {
      const [, dims] = await Promise.all([
        getPdfPageCount(f),   // validates the file is readable
        getPdfPageDimensions(f),
      ])
      setPageDimensions(dims)
      setStep('modal')
    } catch (err) {
      console.error('[SignPdf] failed to read PDF:', err)
      setError('Could not read the PDF. Make sure it is a valid, unencrypted file.')
    }
  }, [])

  const handleModalConfirm = (output: SignatureOutput) => {
    setSignature(output)
    setStep('placement')
  }

  const handleModalClose = () => {
    setFile(null); setPageDimensions([])
    setStep('upload')
  }

  const handlePlacementBack = () => setStep('modal')

  const handlePlacementConfirm = useCallback(async (placements: Placement[]) => {
    if (!file || !signature) return

    const requestId = crypto.randomUUID()
    const task = 'pdf-sign'
    setError(null); setIsProcessing(true)
    if (!await prepareSession(task, requestId)) return

    logEvent('pdf_operation_started', { operation_type: task, placement_count: placements.length })
    setButtonLabel('Signing...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('signatureImage', signature.dataUrl)
    formData.append('placements', JSON.stringify(placements))
    formData.append('signerName', signature.signerName)
    formData.append('signatureMethod', signature.source)
    formData.append('requestId', requestId)
    formData.append('task', task)
    formData.append('creditCost', String(creditCost))

    try {
      const response = await actions.operations.signPdf(formData)
      if (response.data?.success) {
        logEvent('pdf_operation_completed', { operation_type: task })
        const token = response.data.data?.claimToken
        if (token) { setClaimToken(token) } else { setDownloadLink(response.data.data?.fileUrl || null) }
        setStep('result')
      } else {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(response.data?.error || 'Failed to sign PDF.')
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Sign PDF')
      setIsProcessing(false)
    }
  }, [file, signature, prepareSession, creditCost])

  const resetAll = () => {
    setFile(null); setPageDimensions([]); setSignature(null)
    setDownloadLink(null); setClaimToken(null); setError(null)
    setStep('upload')
  }

  const goToSignup = () => { if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken); globalThis.location.href = '/signup' }
  const goToSignin = () => { if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken); globalThis.location.href = '/signin' }

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Sign PDF</Text>
            <Text size="sm" color="2">Add your electronic signature and embed an audit record.</Text>
          </Stack>
          <Button href="/dashboard" variant="ghost" size="sm">Back to dashboard</Button>
        </div>

        {/* Upload step */}
        {step === 'upload' && (
          <Card variant="elevated">
            <Stack gap={5} style={{ padding: 'var(--th-space-6)' }}>
              <FileDropzone
                label="Upload PDF"
                hint="Drag and drop or click to browse — one PDF file"
                accept="application/pdf"
                onFiles={handleFiles}
              />
              {error && <ErrorCallout message={error} />}
            </Stack>
          </Card>
        )}

        {/* Placement step — full-height card */}
        {(step === 'modal' || step === 'placement') && file && (
          <Card variant="elevated" style={{ overflow: 'hidden', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            {error && (
              <div style={{ padding: 'var(--th-space-4)' }}>
                <ErrorCallout message={error} />
              </div>
            )}
            {step === 'placement' && signature && (
              <SignaturePlacement
                file={file}
                signature={signature}
                pageDimensions={pageDimensions}
                onConfirm={handlePlacementConfirm}
                onBack={handlePlacementBack}
              />
            )}
            {isProcessing && (
              <div style={{ padding: 'var(--th-space-6)', textAlign: 'center' }}>
                <Text size="sm" color="2">{buttonLabel}</Text>
              </div>
            )}
          </Card>
        )}

        {/* Result step */}
        {step === 'result' && (
          <Card variant="elevated">
            <Stack gap={4} align="center" style={{ padding: 'var(--th-space-6)', paddingBlock: 'var(--th-space-8)' }}>
              {claimToken ? (
                <>
                  <Callout variant="success" title="Your PDF has been signed">
                    Create a free account to download it — no credit card required.
                  </Callout>
                  <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                    <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
                    <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
                  </div>
                </>
              ) : (
                <>
                  <Callout variant="success" title="Your PDF has been signed">
                    Your signature and audit record have been embedded.
                  </Callout>
                  <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                    <Button href={downloadLink!} variant="solid-terra" icon={<DownloadIcon />}>
                      Download signed PDF
                    </Button>
                    <Button variant="ghost" onClick={resetAll}>Sign another PDF</Button>
                  </div>
                </>
              )}
            </Stack>
          </Card>
        )}
      </Stack>

      {/* Signature creation modal — rendered above everything */}
      {file && (
        <SignatureModal
          isOpen={step === 'modal'}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
        />
      )}
    </Container>
  )
}
