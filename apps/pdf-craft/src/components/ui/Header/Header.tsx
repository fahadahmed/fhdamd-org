'use client'
import { useState, useEffect } from 'react'
import { actions } from 'astro:actions'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import * as Sentry from '@sentry/astro'
import { auth } from '../../../firebase/client'
import { SiteNav } from '@fhdamd/threads'
import type { NavCta } from '@fhdamd/threads'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [theme, setTheme]           = useState<'light' | 'dark'>('light')

  /* Sync auth state */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      Sentry.setUser(user ? { id: user.uid, email: user.email ?? undefined } : null)
    })
    return () => unsubscribe()
  }, [])

  /* Sync theme state from <html data-theme> */
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark'
    setTheme(current ?? 'light')
  }, [])

  const handleLogout = async () => {
    try {
      const response = await actions.user.signOutUser({})
      if (!response.data?.success) {
        console.error('Error signing out:', response.error)
        Sentry.captureException(response.error)
        return
      }
      await signOut(auth)
      window.location.href = '/'
    } catch (err) {
      console.error('Error signing out:', err)
      Sentry.captureException(err)
    }
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('th-theme', next)
    setTheme(next)
  }

  const navLinks = [
    { href: '/#tools',        label: 'Tools' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/#pricing',      label: 'Pricing' },
    { href: '/#faq',          label: 'FAQ' },
  ]

  const ctas: NavCta[] = isLoggedIn
    ? [
        { href: '/dashboard',    label: 'Dashboard',  variant: 'ghost' },
        { href: '/buy-credits',  label: 'Buy credits', variant: 'ghost' },
        { label: theme === 'light' ? 'Dark' : 'Light', variant: 'ghost', onClick: toggleTheme },
        { label: 'Log out', variant: 'ghost', onClick: handleLogout },
      ]
    : [
        { label: theme === 'light' ? 'Dark' : 'Light', variant: 'ghost', onClick: toggleTheme },
        { href: '/signin',  label: 'Log in',   variant: 'ghost' },
        { href: '/signup',  label: 'Sign up',  variant: 'solid-ink' },
      ]

  return (
    <SiteNav
      site="pdf-craft"
      links={navLinks}
      ctas={ctas}
      homeHref="/"
    />
  )
}
