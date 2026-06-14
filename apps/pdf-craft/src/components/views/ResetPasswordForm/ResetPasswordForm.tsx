'use client'
import { useState } from 'react'
import { confirmPasswordReset } from 'firebase/auth'
import { Input, Button, Stack, Callout } from '@fhdamd/threads'
import { auth } from '../../../firebase/client'

type Status = 'idle' | 'submitting' | 'success' | 'invalid-link'

interface Props {
  oobCode: string | null
}

export default function ResetPasswordForm({ oobCode }: Props) {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [status, setStatus]       = useState<Status>(oobCode ? 'idle' : 'invalid-link')
  const [error, setError]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setStatus('submitting')

    try {
      await confirmPasswordReset(auth, oobCode!, password)
      setStatus('success')
    } catch (err: any) {
      if (
        err?.code === 'auth/invalid-action-code' ||
        err?.code === 'auth/expired-action-code'
      ) {
        setStatus('invalid-link')
      } else {
        setError('Failed to reset password. Please try again.')
        setStatus('idle')
      }
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
          Password updated
        </p>
        <p style={{
          fontFamily: 'var(--th-font-display)',
          fontSize: 'var(--th-text-base)',
          color: 'var(--th-color-text-2)',
          marginBlockEnd: 'var(--th-space-6)',
        }}>
          Your password has been changed successfully.
        </p>
        <a href="/signin" style={{
          display: 'inline-block',
          fontFamily: 'var(--th-font-display)',
          fontSize: 'var(--th-text-sm)',
          fontWeight: 600,
          color: 'var(--th-color-accent-text)',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}>
          Sign in to your account
        </a>
      </div>
    )
  }

  if (status === 'invalid-link') {
    return (
      <Callout variant="error" title="Link expired or invalid">
        This password reset link has expired or already been used.{' '}
        <a href="/forgot-password" style={{
          color: 'inherit',
          fontWeight: 600,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}>
          Request a new one
        </a>
      </Callout>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={4}>
        {error && <Callout variant="error">{error}</Callout>}
        <Input
          type="password"
          id="new-password"
          name="password"
          label="New password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="new-password"
          hint="At least 6 characters"
          required
        />
        <Input
          type="password"
          id="confirm-password"
          name="confirm"
          label="Confirm new password"
          value={confirm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Button
          type="submit"
          variant="solid-terra"
          disabled={status === 'submitting'}
          style={{ width: '100%' }}
        >
          {status === 'submitting' ? 'Updating…' : 'Update password'}
        </Button>
      </Stack>
    </form>
  )
}
