'use client'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone-esm'
import { actions } from 'astro:actions'
import '../../../styles/operations.css'
import './decryptPdf.css'
import { Button, Heading, Input } from '../../ui'

export default function DecryptPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [buttonLabel, setButtonLabel] = useState('Unlock PDF')

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        setDownloadLink(null)
        setError(null)
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !password) return

    const requestId = crypto.randomUUID()
    const task = 'pdf-decrypt'
    setError(null)
    setButtonLabel('Checking credits...')
    setIsProcessing(true)

    const creditsResponse = await actions.credits.checkCredits({ task, requestId })
    if (!creditsResponse.data?.success) {
      alert(`Insufficient credits for ${task}. Please buy more credits.`)
      setButtonLabel('Unlock PDF')
      setIsProcessing(false)
      return
    }

    setButtonLabel('Unlocking...')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)
    formData.append('requestId', requestId)
    formData.append('task', task)

    try {
      const response = await actions.operations.decryptPdf(formData)
      if (response.data?.success) {
        setDownloadLink(response.data.data?.fileUrl || null)
      } else {
        setError(response.data?.error || 'Failed to unlock PDF')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setButtonLabel('Unlock PDF')
      setIsProcessing(false)
    }
  }

  return (
    <div className="container">
      <div className="container-heading">
        <Heading level="h1" variant="section">Unlock PDF</Heading>
        <p><a href="/dashboard" className="back-to-dashboard">Back to Dashboard</a></p>
      </div>

      {downloadLink ? (
        <div className="decrypt-form">
          <p>Your unlocked PDF is ready.</p>
          <a href={downloadLink} download>Download Unlocked PDF</a>
          <Button
            type="button"
            kind="secondary"
            size="xl"
            onClick={() => { setDownloadLink(null); setFile(null); setPassword('') }}
            text="Unlock Another PDF"
          />
        </div>
      ) : (
        <>
          {!file ? (
            <div {...getRootProps()} className="dropzone-container">
              <input {...getInputProps()} />
              <p>Drag and drop a password-protected PDF here or click to browse</p>
            </div>
          ) : (
            <div className="sortable-item">
              {file.name}
              <Button type="button" kind="tertiary" size="sm" onClick={() => setFile(null)} text="❌" />
            </div>
          )}

          {file && (
            <form onSubmit={handleSubmit} className="decrypt-form">
              <Input
                type="password"
                name="password"
                id="password"
                value={password}
                labelText="PDF Password"
                setValue={setPassword}
              />
              {error && <p className="error-message">{error}</p>}
              <Button
                type="submit"
                kind="primary"
                size="xl"
                disabled={isProcessing || !password}
                text={buttonLabel}
              />
            </form>
          )}
        </>
      )}
    </div>
  )
}
