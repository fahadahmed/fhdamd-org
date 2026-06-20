'use client'
import { useState } from "react"
import { actions } from 'astro:actions'
import {
  Container, Stack, Text, Button, FileDropzone, Callout, Card, Divider,
} from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { logEvent } from '../../../utils/lib/analytics'
import { DownloadIcon, DraggableFileList, ErrorCallout, INSUFFICIENT_CREDITS_ERROR, useDraggableFiles } from '../../shared'

const MAX_IMAGES = 10

export default function ImageToPdf({ creditCost }: { creditCost: number }) {
  const { uploadedFiles, setUploadedFiles, error, setError, handleFiles, sensors, handleDragEnd, handleDelete } = useDraggableFiles(MAX_IMAGES)
  const [isConverting, setIsConverting]   = useState(false)
  const [downloadLink, setDownloadLink]   = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]     = useState('Convert to PDF')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const requestId = crypto.randomUUID()
    const task = 'image-to-pdf'
    setError(null)
    setButtonLabel('Checking credits...')
    setIsConverting(true)

    const response = await actions.credits.checkCredits({ task, requestId, creditCost })
    if (!response.data?.success) {
      setError(INSUFFICIENT_CREDITS_ERROR)
      setButtonLabel('Convert to PDF')
      setIsConverting(false)
      return
    }

    logEvent('pdf_operation_started', { operation_type: task, file_count: uploadedFiles.length })
    setButtonLabel('Converting images...')
    const formData = new FormData()
    uploadedFiles.forEach(file => formData.append('images', file))
    formData.append('requestId', requestId)
    formData.append('task', task)
    formData.append('creditCost', String(creditCost))

    try {
      const convertResponse = await actions.operations.imageToPdf(formData)
      if (convertResponse.data) {
        logEvent('pdf_operation_completed', { operation_type: task, file_count: uploadedFiles.length })
        setDownloadLink(convertResponse.data?.data?.fileUrl || null)
      } else if (convertResponse.error) {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(
          convertResponse.error.code === 'CONTENT_TOO_LARGE'
            ? 'Your images are too large to convert. Please reduce the file sizes or number of images.'
            : 'An unexpected error occurred. Please try again.'
        )
        Sentry.captureException(convertResponse.error)
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      console.error('Error converting images to PDF:', err)
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Convert to PDF')
      setIsConverting(false)
    }
  }

  const reset = () => { setDownloadLink(null); setUploadedFiles([]); setError(null) }
  const atLimit = uploadedFiles.length >= MAX_IMAGES

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Image to PDF</Text>
            <Text size="sm" color="2">Convert PNG and JPG images into a single PDF. Drag to set page order.</Text>
          </Stack>
          <Button href="/dashboard" variant="ghost" size="sm">Back to dashboard</Button>
        </div>

        <Card variant="elevated">
          <Stack gap={5} style={{ padding: 'var(--th-space-6)' }}>

            {downloadLink ? (
              <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
                <Callout variant="success" title="Conversion complete">
                  Your images have been combined into a PDF file.
                </Callout>
                <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                  <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
                    Download PDF
                  </Button>
                  <Button variant="ghost" onClick={reset}>Convert more images</Button>
                </div>
              </Stack>
            ) : (
              <>
                {!atLimit ? (
                  <FileDropzone
                    label="Upload images"
                    hint={`Drag and drop or click to browse — PNG/JPG only, up to ${MAX_IMAGES} images (${uploadedFiles.length}/${MAX_IMAGES} added)`}
                    accept="image/png,image/jpeg"
                    multiple
                    onFiles={handleFiles}
                  />
                ) : (
                  <Callout variant="info">
                    Maximum of {MAX_IMAGES} images reached. Remove an image to add another.
                  </Callout>
                )}

                {uploadedFiles.length > 0 && (
                  <>
                    <Divider />
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Text size="sm" color="1" weight={600}>Images to convert ({uploadedFiles.length})</Text>
                        <Text size="xs" color="2">Drag to reorder — images will appear as pages in this order</Text>
                      </Stack>
                      <DraggableFileList files={uploadedFiles} sensors={sensors} onDragEnd={handleDragEnd} onDelete={handleDelete} />
                    </Stack>

                    {error && <ErrorCallout message={error} />}

                    <form onSubmit={handleSubmit}>
                      <Button type="submit" variant="solid-terra" disabled={isConverting}>
                        {buttonLabel}
                      </Button>
                    </form>
                  </>
                )}

                {error && uploadedFiles.length === 0 && <ErrorCallout message={error} />}
              </>
            )}

          </Stack>
        </Card>

      </Stack>
    </Container>
  )
}
