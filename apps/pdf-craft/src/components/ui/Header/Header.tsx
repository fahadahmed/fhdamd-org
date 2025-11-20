'use client'
import { useEffect } from 'react'
import { actions } from 'astro:actions'
import './header.css'

export default function Header() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY}`
    script.async = true
    document.body.appendChild(script)
  }, [])

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()

    // Wait for reCAPTCHA to be available
    if (!window.grecaptcha) {
      console.log("Captcha failed to load. Try again.")
      return
    }

    // Execute reCAPTCHA
    let captchaToken = ""
    await new Promise(resolve => {
      window.grecaptcha.ready(async () => {
        captchaToken = await window.grecaptcha.execute(
          import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY,
          { action: "logout" }
        )
        resolve(true)
      })
    })

    try {
      const response = await actions.user.signOutUser({ captchaToken })
      if (response.data?.success) {
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  return (
    <div className="header">
      <div><strong>PDF-Craft</strong></div>
      <form onSubmit={handleLogout}>
        <button type="submit">Logout</button>
      </form>
    </div>
  )
}