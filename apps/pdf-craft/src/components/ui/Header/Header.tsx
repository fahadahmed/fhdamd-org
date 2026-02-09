'use client'
import { useState, useEffect } from 'react'
import { actions } from 'astro:actions'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useRecaptcha } from '../../../utils'
import { Button } from '../../'
import { auth } from '../../../firebase/client'
import BuyIcon from '../../../../public/icons/icon-buy.svg'
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

  const handleBuyCredits = async () => {
    const token = await auth.currentUser?.getIdToken();

    const paymentResponse = await fetch(`${import.meta.env.PUBLIC_BASE_FUNCTIONS_URL}/processPayment`, { // Convert URL to environment variable later
      method: 'POST',
      body: JSON.stringify({
        credits: 5,
        amount: 149,
        quantity: 1,
        currency: 'usd',
        productName: 'PCD-Craft Credits Basic',
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email
      }),
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const paymentData = await paymentResponse.json();
    if (!paymentData.url) {
      console.error('Payment URL not found in response');
      return;
    } else {
      window.location.href = paymentData.url;
    }
  }

  return (
    <div className="header">
      <div className="header-logo"><a href="/">pdf <small>craft</small></a></div>
      {isLoggedIn ? (
        <div className="header-links">
          <Button kind="secondary" size="sm" type="button" text="Buy Credits" onClick={handleBuyCredits} />
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