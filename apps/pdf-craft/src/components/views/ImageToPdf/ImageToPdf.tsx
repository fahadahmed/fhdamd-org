'use client'
import { useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { DndContext, useSensors, useSensor, PointerSensor, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { actions } from 'astro:actions'
import './imageToPdf.css'

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
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [buttonLabel, setButtonLabel] = useState('Convert to PDF');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    onDrop: (acceptedFiles: any) => {
      setUploadedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )
  const handleDragEnd = (event: any) => {
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
      console.log('FormData prepared with files:', uploadedFiles);
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
    <div className="multi-image-uploader">
      {downloadLink ? (
        <div>
          <a href={downloadLink} download>Download PDF</a>
          <a href="/dashboard">Back to Dashboard</a>
        </div>
      ) : (
        <>
          <a href="/dashboard" className="back-to-dashboard">Back to Dashboard</a>
          {uploadedFiles.length < 10 ? (
            <div {...getRootProps()} className="dropzone-container">
              <input {...getInputProps()} />
              <p>Drag and drop images here or click to browse (PNG/JPG)</p>
            </div>
          ) : <div>You can upload a maximum of 10 images at a time.</div>}
          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={uploadedFiles.map((file) => file.name)}>
                {uploadedFiles.map((file) => (
                  <SortableItem key={file.name} id={file.name}>
                    <div
                      style={{
                        padding: '10px',
                        margin: '5px 0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: '#f9f9f9',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      {file.name}
                      <button onClick={() => handleDelete(file.name)} style={{ marginLeft: '10px', cursor: 'pointer' }}>
                        ❌
                      </button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
          {uploadedFiles.length > 0 && (
            <form onSubmit={handleSubmit}>
              <button type='submit' disabled={isConverting}>
                {buttonLabel}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}
