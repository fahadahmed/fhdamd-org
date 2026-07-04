'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Input, Button, Stack, Callout } from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { auth } from '../../../firebase/client'
import { useRecaptcha } from '../../../utils'
import { logEvent, setUserId } from '../../../utils/lib/analytics'

export default function SigninForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { getToken } = useRecaptcha('signin')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const captchaToken = await getToken()
    if (!captchaToken) {
      setError('Captcha verification failed. Please try again.')
      setIsLoading(false)
      return
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      const response = await actions.user.verifyUser({ idToken, captchaToken })
      if (!response.data?.redirected) {
        setError('Sign in failed. Please try again.')
        setIsLoading(false)
        return
      }

      logEvent('login', { method: 'email' })
      setUserId(userCredential.user.uid)

      // If the user arrived here after an anonymous operation, migrate their file
      const claimToken = sessionStorage.getItem('pendingClaimToken')
      if (claimToken) {
        sessionStorage.removeItem('pendingClaimToken')
        try {
          await actions.claims.migrateFile({ claimToken })
        } catch {
          // Non-fatal: file may have expired, proceed to dashboard anyway
        }
      }

      window.location.assign('/dashboard')
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.')
      Sentry.captureException(err)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={4}>
        {error && <Callout variant="error">{error}</Callout>}
        <Input
          type="email"
          name="email"
          id="email"
          label="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <div>
          <Input
            type="password"
            name="password"
            id="password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <div style={{ textAlign: 'right', marginBlockStart: 'var(--th-space-1)' }}>
            <a href="/forgot-password" style={{
              fontFamily: 'var(--th-font-display)',
              fontSize: 'var(--th-text-xs)',
              color: 'var(--th-color-text-3)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}>
              Forgot password?
            </a>
          </div>
        </div>
        <Button type="submit" variant="solid-terra" disabled={isLoading} style={{ width: '100%' }}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </form>
  )
}
