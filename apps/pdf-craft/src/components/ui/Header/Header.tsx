'use client'
import { actions } from 'astro:actions'
import { useRecaptcha } from '../../../utils'
import './header.css'

export default function Header() {
  const captchaToken = useRecaptcha('logout');

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaToken) {
      console.log("Captcha verification failed. Try again.")
      return
    }

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