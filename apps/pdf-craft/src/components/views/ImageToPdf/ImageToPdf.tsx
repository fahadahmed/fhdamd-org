'use client'
import { useState } from "react"
import { DndContext, useSensors, useSensor, PointerSensor, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { actions } from 'astro:actions'
import {
  Container, Stack, Text, Button, FileDropzone, Callout, Card, Divider,
} from '@fhdamd/threads'
import { logEvent } from '../../../utils/lib/analytics'

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--th-color-text-3)' }}>
    <circle cx="9" cy="5" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="19" r="1" fill="currentColor" />
    <circle cx="15" cy="5" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="19" r="1" fill="currentColor" />
  </svg>
)

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

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

const MAX_IMAGES = 10

export default function ImageToPdf() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isConverting, setIsConverting]   = useState(false)
  const [downloadLink, setDownloadLink]   = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]     = useState('Convert to PDF')

  const handleFiles = (incoming: File[]) => {
    setUploadedFiles(prev => {
      const remaining = MAX_IMAGES - prev.length
      return [...prev, ...incoming.slice(0, remaining)]
    })
    setError(null)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = uploadedFiles.findIndex(f => f.name === active.id)
      const newIndex = uploadedFiles.findIndex(f => f.name === over?.id)
      setUploadedFiles(items => arrayMove(items, oldIndex, newIndex))
    }
  }

  const handleDelete = (fileName: string) =>
    setUploadedFiles(files => files.filter(f => f.name !== fileName))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const requestId = crypto.randomUUID()
    const task = 'image-to-pdf'
    setError(null)
    setButtonLabel('Checking credits...')
    setIsConverting(true)

    const response = await actions.credits.checkCredits({ task, requestId })
    if (!response.data?.success) {
      setError('Insufficient credits for this operation. Please buy more credits.')
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

    try {
      const convertResponse = await actions.operations.imageToPdf(formData)
      if (convertResponse.data) {
        logEvent('pdf_operation_completed', { operation_type: task, file_count: uploadedFiles.length })
        setDownloadLink(convertResponse.data?.data?.fileUrl || null)
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      console.error('Error converting images to PDF:', err)
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
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={uploadedFiles.map(f => f.name)}>
                          <Stack gap={2}>
                            {uploadedFiles.map((file) => (
                              <SortableItem key={file.name} id={file.name}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--th-space-3)',
                                  padding: 'var(--th-space-3) var(--th-space-4)',
                                  borderRadius: 'var(--th-radius-md)',
                                  border: '1px solid var(--th-color-border)',
                                  background: 'var(--th-color-surface-2)',
                                  cursor: 'grab',
                                }}>
                                  <GripIcon />
                                  <Text size="sm" color="1" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {file.name}
                                  </Text>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(file.name)} aria-label={`Remove ${file.name}`}><XIcon /></Button>
                                </div>
                              </SortableItem>
                            ))}
                          </Stack>
                        </SortableContext>
                      </DndContext>
                    </Stack>

                    {error && <Callout variant="error">{error}</Callout>}

                    <form onSubmit={handleSubmit}>
                      <Button type="submit" variant="solid-terra" disabled={isConverting}>
                        {buttonLabel}
                      </Button>
                    </form>
                  </>
                )}

                {error && uploadedFiles.length === 0 && <Callout variant="error">{error}</Callout>}
              </>
            )}

          </Stack>
        </Card>

      </Stack>
    </Container>
  )
}
