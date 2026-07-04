'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import {
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { Input, Button, Stack, Callout } from '@fhdamd/threads'
import * as Sentry from '@sentry/astro'
import { auth } from '../../../firebase/client'
import { useRecaptcha } from '../../../utils'
import { logEvent, setUserId } from '../../../utils/lib/analytics'

export default function SignupForm() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { getToken } = useRecaptcha('signup')

  // Resolves the Firebase ID token for the appropriate account creation path.
  // Returns isNewUser=false when falling back to sign-in for an existing account.
  const resolveIdToken = async (): Promise<{ idToken: string; isNewUser: boolean }> => {
    const currentUser = auth.currentUser
    if (currentUser?.isAnonymous) {
      const credential = EmailAuthProvider.credential(email, password)
      try {
        const linked = await linkWithCredential(currentUser, credential)
        return { idToken: await linked.user.getIdToken(), isNewUser: true }
      } catch (linkErr: any) {
        if (linkErr.code !== 'auth/email-already-in-use') throw linkErr
        const signed = await signInWithEmailAndPassword(auth, email, password)
        return { idToken: await signed.user.getIdToken(), isNewUser: false }
      }
    }
    const created = await createUserWithEmailAndPassword(auth, email, password)
    return { idToken: await created.user.getIdToken(), isNewUser: true }
  }

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

    const isAnonymousSession = auth.currentUser?.isAnonymous ?? false
    const claimToken = sessionStorage.getItem('pendingClaimToken')

    try {
      const { idToken, isNewUser } = await resolveIdToken()

      const finalizeRes = await actions.user.finalizeLinkedUser({ idToken, name })
      if (!finalizeRes.data?.success) {
        setError(finalizeRes.data?.error || 'Failed to set up your account. Please try again.')
        setIsLoading(false)
        return
      }

      logEvent('sign_up', { method: 'email' })
      if (auth.currentUser) setUserId(auth.currentUser.uid)

      sessionStorage.removeItem('pendingClaimToken')
      if (!isNewUser && claimToken) {
        await actions.claims.migrateFile({ claimToken }).catch(() => {})
        globalThis.location.href = '/dashboard'
      } else {
        globalThis.location.href = isAnonymousSession ? '/buy-credits' : '/dashboard'
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Sign in instead.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.')
      } else {
        setError(err.message || 'An unexpected error occurred.')
        Sentry.captureException(err)
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={4}>
        {error && <Callout variant="error">{error}</Callout>}
        <Input
          type="text"
          name="name"
          id="name"
          label="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="name"
          required
        />
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
        <Input
          type="password"
          name="password"
          id="password"
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          hint="At least 8 characters recommended"
          required
        />
        <Button type="submit" variant="solid-terra" disabled={isLoading} style={{ width: '100%' }}>
          {isLoading ? 'Creating account…' : 'Create account'}
        </Button>
      </Stack>
    </form>
  )
}
