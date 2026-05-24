'use client';
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { Button, Heading } from '../../ui';
import { auth } from '../../../firebase/client'
import type { PricingOption } from '../../../utils'
import { fetchCms } from "../../../utils/lib/cms";
import './pricing.css'


// Fetch the data of the pricing from DatoCMS
// If the user is signed in, then redirect to the checkout page with the selected pricing option
// else redirect to the login/signup page with a redirect back to the checkout page after successful login/signup

type PricingResponse = {
  data: {
    allPricingOptions: PricingOption[];
  };
}

export default function Pricing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);

  useEffect(() => {
    async function loadPricingOptions() {
      try {
        const response = await fetchCms<PricingResponse>("pricing");
        setPricingOptions(response.data.allPricingOptions);
      } catch (error) {
        console.error("Error fetching pricing options:", error);
      }
    }

    loadPricingOptions();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

  const handleBuyCredits = async (option: PricingOption) => {
    const token = await auth.currentUser?.getIdToken();
    const requestId = crypto.randomUUID();

    const paymentResponse = await fetch(`${import.meta.env.PUBLIC_BASE_FUNCTIONS_URL}/processPayment`, { // Convert URL to environment variable later
      method: 'POST',
      body: JSON.stringify({
        credits: option.credits,
        amount: option.price,
        quantity: 1,
        currency: 'usd',
        productName: option.productName,
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        requestId: requestId,
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

  return <div className="pricing">
    <Heading variant='section'>Simple Pricing</Heading>
    <p className='pricing-byline'>Buy credits once, use them anytime. No subscriptions, no expiry.</p>
    <div className="pricing-cards">
      {pricingOptions.map(option => (
        <div key={option.id} className="pricing-card">
          <h3>${(option.price / 100).toFixed(2)}</h3>
          <p><small>{option.credits} credits<br />{option.description}</small></p>
          {/* <Button kind="secondary" size="sm" type="button" text="Buy Credits" onClick={handleBuyCredits} /> */}
          {isLoggedIn ? (
            <Button kind="secondary" size="lg" type="button" text="Buy Credits" onClick={() => handleBuyCredits(option)} />
          ) : (
            <Button kind="secondary" type="linkButton" url="/signup" text="Buy Credits" />
          )}
          <ul>
            <li>upto {option.credits / 2} operations</li>
            <li>Credits never expire</li>
            <li>No subscriptions needed</li>
            <li>Prices in USD</li>
          </ul>
        </div>
      ))}
    </div>
  </div>;
}