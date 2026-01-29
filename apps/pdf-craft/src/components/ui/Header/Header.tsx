'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { useRecaptcha } from '../../../utils'
import { Button } from '../../'
import './header.css'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      <div className="header-logo"><a href="/">pdf <small>craft</small></a></div>
      {isLoggedIn ? (
        <form onSubmit={handleLogout}>
          <button type="submit">Logout</button>
        </form>
      ) : (
        <div className="header-links">
          <Button kind="tertiary" type="linkButton" url="/signin" text="Login" />
          <Button kind="secondary" type="button" text="Sign Up" onClick={() => window.location.href = '/signup'} />
        </div>
      )}
    </div>
  )
}