'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { Input, Button, Stack, Callout } from '@fhdamd/threads'
import { useRecaptcha } from '../../../utils'
import { logEvent, setUserId } from '../../../utils/lib/analytics'

export default function SignupForm() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const captchaToken = useRecaptcha('signup')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaToken) {
      setError('Captcha verification failed. Please try again.')
      return
    }

    try {
      const response = await actions.user.createUser({
        name,
        email,
        password,
        captchaToken,
      })

      if (response.data?.success) {
        logEvent('sign_up', { method: 'email' })
        if (response.data.payload?.userId) {
          setUserId(response.data.payload.userId)
        }
        window.location.href = '/signin'
      } else {
        setError(response.data?.error || 'An unknown error occurred.')
      }
    } catch (err: any) {
      setError(err.message)
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
        <Button type="submit" variant="solid-terra" style={{ width: '100%' }}>
          Create account
        </Button>
      </Stack>
    </form>
  )
}
