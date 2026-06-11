import { useState } from 'react'
import { DndContext, closestCenter, useSensors, useSensor, PointerSensor, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Stack, Text, Button } from '@fhdamd/threads'

export const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

export const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--th-color-text-3)' }}>
    <circle cx="9" cy="5" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="19" r="1" fill="currentColor" />
    <circle cx="15" cy="5" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="19" r="1" fill="currentColor" />
  </svg>
)

export function useDraggableFiles(maxFiles: number) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFiles = (incoming: File[]) => {
    setUploadedFiles(prev => {
      const remaining = maxFiles - prev.length
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

  return { uploadedFiles, setUploadedFiles, error, setError, handleFiles, sensors, handleDragEnd, handleDelete }
}

export function SortableItem({ id, children }: { readonly id: string; readonly children: React.ReactNode }) {
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

export function DraggableFileList({
  files,
  sensors,
  onDragEnd,
  onDelete,
}: {
  readonly files: readonly File[]
  readonly sensors: any
  readonly onDragEnd: (event: DragEndEvent) => void
  readonly onDelete: (name: string) => void
}) {
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={files.map(f => f.name)}>
        <Stack gap={2}>
          {files.map((file) => (
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
                <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(file.name)} aria-label={`Remove ${file.name}`}><XIcon /></Button>
              </div>
            </SortableItem>
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  )
}
