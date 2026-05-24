'use client'
import { useState, useEffect } from 'react'
import { actions } from 'astro:actions'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useRecaptcha } from '../../../utils'
import { Button } from '../../'
import { auth } from '../../../firebase/client'
import './header.css'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const captchaToken = useRecaptcha('logout');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in:", user.email)
        setIsLoggedIn(true)
      } else {
        console.log("No user session found.")
        setIsLoggedIn(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaToken) {
      console.log("Captcha verification failed. Try again.")
      return
    }

    try {
      const response = await actions.user.signOutUser({ captchaToken })
      await signOut(auth)
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
        <div className="header-links">
          <Button kind="tertiary" type="linkButton" url="/dashboard" text="Dashboard" />
          <Button kind="tertiary" type="linkButton" url="/buy-credits" text="Buy Credits" />
          <form onSubmit={handleLogout}>
            <Button kind="secondary" type="submit" size="sm" text="Logout" />
          </form>
        </div>
      ) : (
        <div className="header-links">
          <Button kind="tertiary" type="linkButton" url="/signin" text="Login" />
          <Button kind="secondary" type="button" text="Sign Up" onClick={() => window.location.href = '/signup'} />
        </div>
      )}
    </div>
  )
}