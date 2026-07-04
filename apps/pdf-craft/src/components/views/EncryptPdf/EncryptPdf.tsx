'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { signInAnonymously } from 'firebase/auth'
import {
  Container, Stack, Text, Button, Input, FileDropzone, Callout, Card, Divider, Radio,
} from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { auth } from '../../../firebase/client'
import { logEvent } from '../../../utils/lib/analytics'
import { XIcon, DownloadIcon, ErrorCallout, INSUFFICIENT_CREDITS_ERROR } from '../../shared'

type PermissionPreset = 'full-access' | 'view-and-print' | 'read-only'

const PRESETS: { value: PermissionPreset; label: string; description: string }[] = [
  { value: 'full-access',    label: 'Full Access',    description: 'No restrictions on the PDF' },
  { value: 'view-and-print', label: 'View & Print',   description: 'Can view and print — no editing or copying' },
  { value: 'read-only',      label: 'Read Only',      description: 'View only — no printing, copying, or editing' },
]

export default function EncryptPdf({ creditCost, isAuthenticated = false }: { creditCost: number; isAuthenticated?: boolean }) {
  const [file, setFile]                   = useState<File | null>(null)
  const [userPassword, setUserPassword]   = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [permissions, setPermissions]     = useState<PermissionPreset>('full-access')
  const [isProcessing, setIsProcessing]   = useState(false)
  const [downloadLink, setDownloadLink]   = useState<string | null>(null)
  const [claimToken, setClaimToken]       = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]     = useState('Protect PDF')

  const handleFiles = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      setDownloadLink(null)
      setClaimToken(null)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !userPassword) return

    const requestId = crypto.randomUUID()
    const task = 'pdf-encrypt'
    setError(null)
    setIsProcessing(true)

    const currentUser = auth.currentUser
    const isAnon = !isAuthenticated

    if (isAnon) {
      setButtonLabel('Processing...')
      if (!currentUser) {
        try {
          const credential = await signInAnonymously(auth)
          const idToken = await credential.user.getIdToken()
          const sessionRes = await actions.user.createAnonymousSession({ idToken })
          if (!sessionRes.data?.success) {
            setError('Failed to start session. Please try again.')
            setButtonLabel('Protect PDF')
            setIsProcessing(false)
            return
          }
        } catch (err) {
          setError('Failed to start session. Please try again.')
          setButtonLabel('Protect PDF')
          setIsProcessing(false)
          Sentry.captureException(err)
          return
        }
      }
    } else {
      setButtonLabel('Checking credits...')
      const creditsResponse = await actions.credits.checkCredits({ task, requestId, creditCost })
      if (!creditsResponse.data?.success) {
        setError(INSUFFICIENT_CREDITS_ERROR)
        setButtonLabel('Protect PDF')
        setIsProcessing(false)
        return
      }
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
    formData.append('creditCost', String(creditCost))

    try {
      const response = await actions.operations.encryptPdf(formData)
      if (response.data?.success) {
        logEvent('pdf_operation_completed', { operation_type: task })
        const token = response.data.data?.claimToken
        if (token) {
          setClaimToken(token)
        } else {
          setDownloadLink(response.data.data?.fileUrl || null)
        }
      } else {
        logEvent('pdf_operation_failed', { operation_type: task })
        setError(response.data?.error || 'Failed to protect PDF.')
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Protect PDF')
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setDownloadLink(null); setClaimToken(null); setFile(null)
    setUserPassword(''); setOwnerPassword('')
    setError(null); setPermissions('full-access')
  }

  const goToSignup = () => {
    if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken)
    window.location.href = '/signup'
  }

  const goToSignin = () => {
    if (claimToken) sessionStorage.setItem('pendingClaimToken', claimToken)
    window.location.href = '/signin'
  }

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Protect PDF</Text>
            <Text size="sm" color="2">Add password protection and set permissions on a PDF file.</Text>
          </Stack>
          <Button href="/dashboard" variant="ghost" size="sm">Back to dashboard</Button>
        </div>

        <Card variant="elevated">
          <Stack gap={5} style={{ padding: 'var(--th-space-6)' }}>

            {claimToken ? (
              <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
                <Callout variant="success" title="Your PDF is protected">
                  Create a free account to download it — no credit card required.
                </Callout>
                <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                  <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
                  <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
                </div>
              </Stack>
            ) : downloadLink ? (
              <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
                <Callout variant="success" title="Your PDF is protected">
                  The file has been encrypted with the password you provided.
                </Callout>
                <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
                  <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
                    Download protected PDF
                  </Button>
                  <Button variant="ghost" onClick={reset}>Protect another PDF</Button>
                </div>
              </Stack>
            ) : (
              <>
                {!file ? (
                  <FileDropzone
                    label="Upload PDF"
                    hint="Drag and drop or click to browse — one PDF file"
                    accept="application/pdf"
                    onFiles={handleFiles}
                  />
                ) : (
                  <Stack gap={3}>
                    <Text size="sm" color="2" weight={500}>Selected file</Text>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--th-space-3) var(--th-space-4)',
                      borderRadius: 'var(--th-radius-md)',
                      border: '1px solid var(--th-color-border)',
                      background: 'var(--th-color-surface-2)',
                    }}>
                      <Text size="sm" color="1">{file.name}</Text>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} aria-label="Remove file"><XIcon /></Button>
                    </div>
                  </Stack>
                )}

                {file && (
                  <>
                    <Divider />
                    <form onSubmit={handleSubmit}>
                      <Stack gap={6}>

                        <Stack gap={4}>
                          <Text as="h2" size="base" color="1" weight={600}>Password</Text>
                          <Input
                            type="password"
                            name="userPassword"
                            id="userPassword"
                            label="Open password"
                            hint="Users need this password to open the PDF"
                            value={userPassword}
                            onChange={e => setUserPassword(e.target.value)}
                            required
                          />
                          <Input
                            type="password"
                            name="ownerPassword"
                            id="ownerPassword"
                            label="Owner password (optional)"
                            hint="Leave blank to use the same password as above"
                            value={ownerPassword}
                            onChange={e => setOwnerPassword(e.target.value)}
                          />
                        </Stack>

                        <Stack gap={3}>
                          <Text as="h2" size="base" color="1" weight={600}>Permissions</Text>
                          <Stack gap={2}>
                            {PRESETS.map((preset) => (
                              <label
                                key={preset.value}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--th-space-3)',
                                  padding: 'var(--th-space-3) var(--th-space-4)',
                                  borderRadius: 'var(--th-radius-md)',
                                  border: `1px solid ${permissions === preset.value ? 'var(--th-color-accent)' : 'var(--th-color-border)'}`,
                                  background: permissions === preset.value ? 'var(--th-color-surface-2)' : 'var(--th-color-surface-1)',
                                  cursor: 'pointer',
                                  transition: 'border-color var(--th-duration-base) var(--th-ease-base)',
                                }}
                              >
                                <Radio
                                  name="permissions"
                                  value={preset.value}
                                  checked={permissions === preset.value}
                                  onChange={() => setPermissions(preset.value)}
                                  label=""
                                />
                                <Stack gap={0}>
                                  <Text as="span" size="sm" color="1" weight={600}>{preset.label}</Text>
                                  <Text as="span" size="xs" color="2">{preset.description}</Text>
                                </Stack>
                              </label>
                            ))}
                          </Stack>
                        </Stack>

                        {error && <ErrorCallout message={error} />}
                        <Button
                          type="submit"
                          variant="solid-terra"
                          disabled={isProcessing || !userPassword}
                          style={{ alignSelf: 'flex-start' }}
                        >
                          {buttonLabel}
                        </Button>
                      </Stack>
                    </form>
                  </>
                )}
              </>
            )}

          </Stack>
        </Card>

      </Stack>
    </Container>
  )
}
