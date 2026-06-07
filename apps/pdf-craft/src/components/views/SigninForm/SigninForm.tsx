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
  const captchaToken = useRecaptcha('signin')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaToken) {
      setError('Captcha verification failed. Please try again.')
      return
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      const response = await actions.user.verifyUser({ idToken, captchaToken })
      if (response.data?.redirected) {
        logEvent('login', { method: 'email' })
        setUserId(userCredential.user.uid)
        window.location.assign(response.data?.url)
      }
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.')
      console.error('Error signing in:', err)
      Sentry.captureException(err)
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
        <Button type="submit" variant="solid-terra" style={{ width: '100%' }}>
          Sign in
        </Button>
      </Stack>
    </form>
  )
}
