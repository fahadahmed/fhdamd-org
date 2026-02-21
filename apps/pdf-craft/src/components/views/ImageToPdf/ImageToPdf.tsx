'use client'
import { useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { DndContext, useSensors, useSensor, PointerSensor, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { actions } from 'astro:actions'
import '../../../styles/operations.css'
import { Button, Heading } from "../../ui"

type SortableItemProps = {
  id: string
  children: React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export default function MultiImageUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [buttonLabel, setButtonLabel] = useState('Convert to PDF');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    onDrop: (acceptedFiles: File[]) => {
      setUploadedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = uploadedFiles.findIndex((file) => file.name === active.id)
      const newIndex = uploadedFiles.findIndex((file) => file.name === over?.id)
      setUploadedFiles((items) => arrayMove(items, oldIndex, newIndex))
    }
  }

  const handleDelete = (fileName: string) => {
    setUploadedFiles((files) => files.filter((file) => file.name !== fileName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const task = 'image-to-pdf';
    setButtonLabel('Checking credits...');
    setIsConverting(true);

    const response = await actions.credits.checkCredits({ task });
    if (response.data?.success) {
      setButtonLabel('Converting images...');
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append('images', file));
      try {
        const convertResponse = await actions.operations.imageToPdf(formData);
        if (convertResponse.data) {
          setDownloadLink(convertResponse.data?.data?.fileUrl || null);
        }
      } catch (err) {
        console.error('Error converting images to PDF:', err);
      } finally {
        setButtonLabel('Convert to PDF');
        setIsConverting(false);
      }
    } else {
      alert(`Insufficient credits for ${task}. Please buy more credits.`);
      setButtonLabel('Convert to PDF');
      setIsConverting(false);
    }
  }

  return (
    <div className="container">
      <div className="container-heading">
        <Heading level="h1" variant='section'>Convert to PDF</Heading>
        <p><a href="/dashboard" className="back-to-dashboard">Back to Dashboard</a></p>
      </div>
      {downloadLink ? (
        <div>
          <a href={downloadLink} download>Download PDF</a>
        </div>
      ) : (
        <>
          {uploadedFiles.length < 10 ? (
            <div {...getRootProps()} className="dropzone-container">
              <input {...getInputProps()} />
              <p>Drag and drop images here or click to browse (PNG/JPG)</p>
            </div>
          ) : <div>You can upload a maximum of 10 images at a time.</div>}
          <div>
            {uploadedFiles.length > 0 && (
              <>
                <Heading variant="subsection">Uploaded Files</Heading>
                <p>Drag the files up & down to change the order in the merged file.</p>
              </>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={uploadedFiles.map((file) => file.name)}>
                {uploadedFiles.map((file) => (
                  <SortableItem key={file.name} id={file.name}>
                    <div
                      className="sortable-item"
                    >
                      {file.name}
                      <Button type="button" kind="tertiary" size='sm' onClick={() => handleDelete(file.name)} text="❌" />
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
          {uploadedFiles.length > 0 && (
            <form onSubmit={handleSubmit}>
              <Button type="submit" kind="primary" size="xl" disabled={isConverting} text={buttonLabel} />
            </form>
          )}
        </>
      )}
    </div>
  )
}
