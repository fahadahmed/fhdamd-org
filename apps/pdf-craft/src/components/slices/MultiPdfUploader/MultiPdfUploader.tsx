'use client'
import { useState } from "react"
import { actions } from 'astro:actions'
import {
  Container, Stack, Text, Button, FileDropzone, Callout, Card, Divider,
} from '@fhdamd/threads'
import { logEvent } from '../../../utils/lib/analytics'
import { buildPrepareSession } from '../../../utils/lib/operationSession'
import { DownloadIcon, DraggableFileList, ErrorCallout, useDraggableFiles } from '../../shared'

const MAX_FILES = 5

export default function MultiPdfUploader({ creditCost, isAuthenticated = false }: { readonly creditCost: number; readonly isAuthenticated?: boolean }) {
  const { uploadedFiles, setUploadedFiles, error, setError, handleFiles, sensors, handleDragEnd, handleDelete } = useDraggableFiles(MAX_FILES)
  const [isMerging, setIsMerging]       = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [claimToken, setClaimToken]     = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]   = useState('Merge PDFs')

  const prepareSession = buildPrepareSession({
    isAuthenticated, creditCost, defaultLabel: 'Merge PDFs',
    setButtonLabel, setError: (e) => setError(e), setProcessing: setIsMerging,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const requestId = crypto.randomUUID()
    const task = 'merge'
    setError(null)
    setIsMerging(true)

    if (!await prepareSession(task, requestId)) return

    logEvent('pdf_operation_started', { operation_type: task, file_count: uploadedFiles.length })
    setButtonLabel('Merging PDFs...')

    const formData = new FormData()
    uploadedFiles.forEach(file => formData.append('files', file))
    formData.append('requestId', requestId)
    formData.append('task', task)
    formData.append('creditCost', String(creditCost))

    try {
      const mergeResponse = await actions.operations.mergePdfs(formData)
      if (mergeResponse.data) {
        logEvent('pdf_operation_completed', { operation_type: task, file_count: uploadedFiles.length })
        const token = mergeResponse.data?.data?.claimToken
        if (token) {
          setClaimToken(token)
        } else {
          setDownloadLink(mergeResponse.data?.data?.fileUrl || null)
        }
      } else if (mergeResponse.error) {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(
          mergeResponse.error.code === 'CONTENT_TOO_LARGE'
            ? 'Your files are too large to merge. Please reduce the file sizes or number of files.'
            : 'An unexpected error occurred. Please try again.'
        )
        Sentry.captureException(mergeResponse.error)
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Merge PDFs')
      setIsMerging(false)
    }
  }

  const reset = () => { setDownloadLink(null); setClaimToken(null); setUploadedFiles([]); setError(null) }
  const atLimit = uploadedFiles.length >= MAX_FILES

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
        <Callout variant="success" title="Merge complete">
          Create a free account to download your merged PDF — no credit card required.
        </Callout>
        <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
          <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
          <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
        </div>
      </Stack>
    )
    if (downloadLink) return (
      <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
        <Callout variant="success" title="Merge complete">
          Your PDFs have been combined into a single file.
        </Callout>
        <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
          <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
            Download merged PDF
          </Button>
          <Button variant="ghost" onClick={reset}>Merge more PDFs</Button>
        </div>
      </Stack>
    )
    return (
      <>
        {!atLimit ? (
          <FileDropzone
            label="Upload PDFs"
            hint={`Drag and drop or click to browse — PDF files only, up to ${MAX_FILES} (${uploadedFiles.length}/${MAX_FILES} added)`}
            accept="application/pdf"
            multiple
            onFiles={handleFiles}
          />
        ) : (
          <Callout variant="info">
            Maximum of {MAX_FILES} files reached. Remove a file to add another.
          </Callout>
        )}
        {uploadedFiles.length > 0 && (
          <>
            <Divider />
            <Stack gap={3}>
              <Stack gap={1}>
                <Text size="sm" color="1" weight={600}>Files to merge ({uploadedFiles.length})</Text>
                <Text size="xs" color="2">Drag to reorder — files will be merged top to bottom</Text>
              </Stack>
              <DraggableFileList files={uploadedFiles} sensors={sensors} onDragEnd={handleDragEnd} onDelete={handleDelete} />
            </Stack>
            {error && <ErrorCallout message={error} />}
            <form onSubmit={handleSubmit}>
              <Button type="submit" variant="solid-terra" disabled={isMerging || uploadedFiles.length < 2}>
                {buttonLabel}
              </Button>
            </form>
          </>
        )}
        {error && uploadedFiles.length === 0 && <ErrorCallout message={error} />}
      </>
    )
  }

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Merge PDFs</Text>
            <Text size="sm" color="2">Combine multiple PDF files into one. Drag to reorder before merging.</Text>
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
