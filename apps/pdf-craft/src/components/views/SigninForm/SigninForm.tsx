'use client'
import { useState, useEffect } from 'react'
import { actions } from 'astro:actions'
import { browserLocalPersistence, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../../firebase/client'
import { Button, Input } from '../../../components'
import '../../../styles/form.css'

export default function SigninForm() {
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      console.log(idToken)
      const response = await actions.user.verifyUser({ idToken, captchaToken })
      if (response.data?.redirected) {
        window.location.assign(response.data?.url)
      }
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.')
      console.error('Error signing in:', err)
    }

  }
  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Input type="email" name="email" id="email" labelText='Email' value={email} setValue={setEmail} />
      <Input type="password" name="password" id="password" labelText='Password' value={password} setValue={setPassword} />
      <Button type="submit" text="Login" kind="primary" />
    </form>
  )
}