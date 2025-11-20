'use client'
import { useState, useEffect } from 'react'
import { actions } from 'astro:actions'
import { Button, Input } from '../../../components'

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY}`
    script.async = true
    document.body.appendChild(script)
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Wait for reCAPTCHA to be available
    if (!window.grecaptcha) {
      setError("Captcha failed to load. Try again.")
      return
    }

    // Execute reCAPTCHA
    let captchaToken = ""
    await new Promise(resolve => {
      window.grecaptcha.ready(async () => {
        captchaToken = await window.grecaptcha.execute(
          import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY,
          { action: "signup" }
        )
        resolve(true)
      })
    })

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