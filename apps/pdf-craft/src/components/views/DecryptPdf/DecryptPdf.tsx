'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { signInAnonymously } from 'firebase/auth'
import {
  Container, Stack, Text, Button, Input, FileDropzone, Callout, Card, Divider,
} from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { auth } from '../../../firebase/client'
import { logEvent } from '../../../utils/lib/analytics'
import { XIcon, DownloadIcon, ErrorCallout, INSUFFICIENT_CREDITS_ERROR } from '../../shared'

export default function DecryptPdf({ creditCost, isAuthenticated = false }: { readonly creditCost: number; readonly isAuthenticated?: boolean }) {
  const [file, setFile]                 = useState<File | null>(null)
  const [password, setPassword]         = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadLink, setDownloadLink] = useState<string | null>(null)
  const [claimToken, setClaimToken]     = useState<string | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [buttonLabel, setButtonLabel]   = useState('Unlock PDF')

  const handleFiles = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      setDownloadLink(null)
      setClaimToken(null)
      setError(null)
    }
  }

  const prepareSession = async (task: string, requestId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setButtonLabel('Processing...')
      if (!auth.currentUser) {
        try {
          const credential = await signInAnonymously(auth)
          const idToken = await credential.user.getIdToken()
          const sessionRes = await actions.user.createAnonymousSession({ idToken })
          if (!sessionRes.data?.success) {
            setError('Failed to start session. Please try again.')
            setButtonLabel('Unlock PDF')
            setIsProcessing(false)
            return false
          }
        } catch (err) {
          setError('Failed to start session. Please try again.')
          setButtonLabel('Unlock PDF')
          setIsProcessing(false)
          Sentry.captureException(err)
          return false
        }
      }
      return true
    }
    setButtonLabel('Checking credits...')
    const creditsResponse = await actions.credits.checkCredits({ task, requestId, creditCost })
    if (!creditsResponse.data?.success) {
      setError(INSUFFICIENT_CREDITS_ERROR)
      setButtonLabel('Unlock PDF')
      setIsProcessing(false)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !password) return

    const requestId = crypto.randomUUID()
    const task = 'pdf-decrypt'
    setError(null)
    setIsProcessing(true)

    if (!await prepareSession(task, requestId)) return

    logEvent('pdf_operation_started', { operation_type: task })
    setButtonLabel('Unlocking...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)
    formData.append('requestId', requestId)
    formData.append('task', task)
    formData.append('creditCost', String(creditCost))

    try {
      const response = await actions.operations.decryptPdf(formData)
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
        setError(response.data?.error || 'Failed to unlock PDF.')
      }
    } catch (err) {
      logEvent('pdf_operation_failed', { operation_type: task })
      setError('An unexpected error occurred. Please try again.')
      Sentry.captureException(err)
    } finally {
      setButtonLabel('Unlock PDF')
      setIsProcessing(false)
    }
  }

  const reset = () => { setDownloadLink(null); setClaimToken(null); setFile(null); setPassword(''); setError(null) }

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
        <Callout variant="success" title="Your PDF is unlocked">
          Create a free account to download it — no credit card required.
        </Callout>
        <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
          <Button variant="solid-terra" onClick={goToSignup}>Sign up to download</Button>
          <Button variant="ghost" onClick={goToSignin}>Already have an account?</Button>
        </div>
      </Stack>
    )
    if (downloadLink) return (
      <Stack gap={4} align="center" style={{ paddingBlock: 'var(--th-space-4)' }}>
        <Callout variant="success" title="Your PDF is unlocked">
          The password protection has been removed successfully.
        </Callout>
        <div style={{ display: 'flex', gap: 'var(--th-space-3)', flexWrap: 'wrap' }}>
          <Button href={downloadLink} variant="solid-terra" icon={<DownloadIcon />}>
            Download unlocked PDF
          </Button>
          <Button variant="ghost" onClick={reset}>Unlock another PDF</Button>
        </div>
      </Stack>
    )
    return (
      <>
        {!file ? (
          <FileDropzone label="Upload PDF" hint="Drag and drop or click to browse — one PDF file"
            accept="application/pdf" onFiles={handleFiles} />
        ) : (
          <Stack gap={3}>
            <Text size="sm" color="2" weight={500}>Selected file</Text>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
              <Stack gap={4}>
                <Input type="password" name="password" id="password" label="PDF password"
                  hint="Enter the password that protects this file" value={password}
                  onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                {error && <ErrorCallout message={error} />}
                <Button type="submit" variant="solid-terra" disabled={isProcessing || !password}
                  style={{ alignSelf: 'flex-start' }}>
                  {buttonLabel}
                </Button>
              </Stack>
            </form>
          </>
        )}
      </>
    )
  }

  return (
    <Container>
      <Stack gap={6} style={{ paddingBlock: 'var(--th-space-8)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--th-space-3)' }}>
          <Stack gap={1}>
            <Text as="h1" size="2xl" color="1" weight={650} width={90}>Unlock PDF</Text>
            <Text size="sm" color="2">Remove password protection from a PDF file.</Text>
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
