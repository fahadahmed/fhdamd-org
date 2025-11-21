'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { Button, Input } from '../../../components'
import { useRecaptcha } from '../../../utils'

export default function SignupForm() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState('');
  const captchaToken = useRecaptcha('signup');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaToken) {
      setError('Captcha verification failed. Try again.')
      return
    }

    try {
      const response = await actions.user.createUser({
        name,
        email,
        password,
        captchaToken
      })

      if (response.data?.success) {
        window.location.href = '/signin'
      } else {
        setError(response.data?.error || 'An unknown error occurred')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Input type="text" name="name" id="name" labelText='Name' value={name} setValue={setName} />
      <Input type="email" name="email" id="email" labelText='Email' value={email} setValue={setEmail} />
      <Input type="password" name="password" id="password" labelText='Password' value={password} setValue={setPassword} />
      <Button type="submit" text="Register" kind="primary" />
    </form>
  )
}