'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { Input, Button, Stack, Callout } from '@fhdamd/threads'
import { useRecaptcha } from '../../../utils'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const { getToken } = useRecaptcha('forgot_password')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const captchaToken = await getToken()
    if (!captchaToken) {
      setError('Captcha verification failed. Please try again.')
      setStatus('error')
      return
    }

    try {
      const res = await actions.user.sendPasswordReset({ email, captchaToken })
      if (res.data?.success) {
        setStatus('success')
      } else {
        setError(res.data?.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        background: 'var(--th-color-sage-subtle)',
        borderRadius: 'var(--th-radius-lg)',
        padding: 'var(--th-space-8) var(--th-space-6)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--th-font-display)',
          fontSize: 'var(--th-text-lg)',
          fontVariationSettings: '"wdth" 92, "wght" 650',
          color: 'var(--th-color-sage-text)',
          marginBlockEnd: 'var(--th-space-2)',
        }}>
          Check your email
        </p>
        <p style={{
          fontFamily: 'var(--th-font-display)',
          fontSize: 'var(--th-text-base)',
          color: 'var(--th-color-text-2)',
        }}>
          If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={4}>
        {status === 'error' && error && (
          <Callout variant="error">{error}</Callout>
        )}
        <Input
          type="email"
          id="reset-email"
          name="email"
          label="Email address"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Button
          type="submit"
          variant="solid-terra"
          disabled={status === 'sending'}
          style={{ width: '100%' }}
        >
          {status === 'sending' ? 'Sending…' : 'Send reset link'}
        </Button>
      </Stack>
    </form>
  )
}
