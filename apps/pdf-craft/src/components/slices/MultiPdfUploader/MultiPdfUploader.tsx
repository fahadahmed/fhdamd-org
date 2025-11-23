'use client'
import { useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { DndContext, useSensors, useSensor, PointerSensor, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { actions } from 'astro:actions'
import './multiPdfUploader.css'

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

export default function MultiPdfUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [buttonLabel, setButtonLabel] = useState('Merge PDFs');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
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
    const task = 'merge';
    setButtonLabel('Checking credits...');
    setIsMerging(true);
    const response = await actions.credits.checkCredits({
      task
    });
    console.log('Check Credits response:', response);
    if (response.data?.success) {
      setButtonLabel('Merging PDFs...');
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      try {
        console.log(Array.from(formData.values()))
        const response = await actions.operations.mergePdfs(formData)
        console.log(response)
        if (response.data) {
          console.log('Merge PDF operations response', response.data)
          setDownloadLink(response.data?.data?.fileUrl || null);
        }
      } catch (err) {
        console.error('Error merging PDFs:', err);
      } finally {
        setButtonLabel('Merge PDFs');
        setIsMerging(false);
      }
    } else {
      alert(`Insufficient credits for ${task}. Please buy more credits.`);
      setButtonLabel('Merge PDFs');
      setIsMerging(false);
    }

  }
  return (
    <div className="multi-pdf-uploader">
      {downloadLink ? (
        <div>
          <a href={downloadLink} download>Download Merged PDF</a>
          <a href="/dashboard">Back to Dashboard</a>
        </div>
      ) : (
        <>
          <a href="/dashboard" className="back-to-dashboard">Back to Dashboard</a>
          {uploadedFiles.length < 5 ? (
            <div {...getRootProps()} className="dropzone-container">
              <input {...getInputProps()} />
              <p>Drag and drop files here or click to browse.</p>
            </div>
          ) : <div>You can merge a maximum of 5 files at a time.</div>}
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
              <button type='submit' disabled={isMerging}>
                {buttonLabel}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}