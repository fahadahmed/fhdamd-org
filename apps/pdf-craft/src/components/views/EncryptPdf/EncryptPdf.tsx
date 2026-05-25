'use client'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone-esm'
import { actions } from 'astro:actions'
import '../../../styles/operations.css'
import './encryptPdf.css'
import { Button, Heading, Input } from '../../ui'
import { logEvent } from '../../../utils/lib/analytics'

type PermissionPreset = 'full-access' | 'view-and-print' | 'read-only'

const PRESETS: { value: PermissionPreset; label: string; description: string }[] = [
  { value: 'full-access', label: 'Full Access', description: 'No restrictions on the PDF' },
  { value: 'view-and-print', label: 'View & Print', description: 'Can view and print — no editing or copying' },
  { value: 'read-only', label: 'Read Only', description: 'View only — no printing, copying, or editing' },
]

export default function EncryptPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [userPassword, setUserPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [permissions, setPermissions] = useState<PermissionPreset>('full-access')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [buttonLabel, setButtonLabel] = useState('Protect PDF')

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
    if (!file || !userPassword) return

    const requestId = crypto.randomUUID()
    const task = 'pdf-encrypt'
    setError(null)
    setButtonLabel('Checking credits...')
    setIsProcessing(true)

    const creditsResponse = await actions.credits.checkCredits({ task, requestId })
    if (!creditsResponse.data?.success) {
      alert(`Insufficient credits for ${task}. Please buy more credits.`)
      setButtonLabel('Protect PDF')
      setIsProcessing(false)
      return
    }

    logEvent('pdf_operation_started', { operation_type: task })
    setButtonLabel('Encrypting...')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userPassword', userPassword)
    formData.append('ownerPassword', ownerPassword)
    formData.append('permissions', permissions)
    formData.append('requestId', requestId)
    formData.append('task', task)

    try {
      const response = await actions.operations.encryptPdf(formData)
      if (response.data?.success) {
        logEvent('pdf_operation_completed', { operation_type: task })
        setDownloadLink(response.data.data?.fileUrl || null)
      } else {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(response.data?.error || 'Failed to encrypt PDF')
      }
    } catch {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setButtonLabel('Protect PDF')
      setIsProcessing(false)
    }
  }

  return (
    <div className="container">
      <div className="container-heading">
        <Heading level="h1" variant="section">Protect PDF</Heading>
        <p><a href="/dashboard" className="back-to-dashboard">Back to Dashboard</a></p>
      </div>

      {downloadLink ? (
        <div className="encrypt-form">
          <p>Your protected PDF is ready.</p>
          <a href={downloadLink} download>Download Protected PDF</a>
          <Button
            type="button"
            kind="secondary"
            size="xl"
            onClick={() => { setDownloadLink(null); setFile(null); setUserPassword(''); setOwnerPassword('') }}
            text="Protect Another PDF"
          />
        </div>
      ) : (
        <>
          {!file ? (
            <div {...getRootProps()} className="dropzone-container">
              <input {...getInputProps()} />
              <p>Drag and drop a PDF here or click to browse</p>
            </div>
          ) : (
            <div className="sortable-item">
              {file.name}
              <Button type="button" kind="tertiary" size="sm" onClick={() => setFile(null)} text="❌" />
            </div>
          )}

          {file && (
            <form onSubmit={handleSubmit} className="encrypt-form">
              <div className="form-section">
                <Heading variant="subsection">Password</Heading>
                <Input
                  type="password"
                  name="userPassword"
                  id="userPassword"
                  value={userPassword}
                  labelText="Open Password (required — users need this to open the PDF)"
                  setValue={setUserPassword}
                />
                <Input
                  type="password"
                  name="ownerPassword"
                  id="ownerPassword"
                  value={ownerPassword}
                  labelText="Owner Password (optional — leave blank to use the same password above)"
                  setValue={setOwnerPassword}
                />
              </div>

              <div className="form-section">
                <Heading variant="subsection">Permissions</Heading>
                <div className="permission-presets">
                  {PRESETS.map((preset) => (
                    <label
                      key={preset.value}
                      className={`preset-option${permissions === preset.value ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="permissions"
                        value={preset.value}
                        checked={permissions === preset.value}
                        onChange={() => setPermissions(preset.value)}
                      />
                      <span className="preset-label">{preset.label}</span>
                      <span className="preset-desc">{preset.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="error-message">{error}</p>}
              <Button
                type="submit"
                kind="primary"
                size="xl"
                disabled={isProcessing || !userPassword}
                text={buttonLabel}
              />
            </form>
          )}
        </>
      )}
    </div>
  )
}
