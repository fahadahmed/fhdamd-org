'use client';
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { Container, Stack, Text, AutoGrid, PriceCard } from '@fhdamd/threads'
import { auth } from '../../../firebase/client'
import type { PricingOption } from '../../../utils'
import { fetchCms } from '../../../utils/lib/cms'
import { logEvent } from '../../../utils/lib/analytics'

type PricingResponse = {
  data: {
    allPricingOptions: PricingOption[];
  };
}

function getOps(credits: number) {
  return [
    { label: 'Merge PDFs',       tag: `${credits / 2} merges` },
    { label: 'Image to PDF',     tag: `${credits / 2} converts` },
    { label: 'Protect / Unlock', tag: `${Math.floor(credits / 4)} ops` },
  ]
}

export default function Pricing() {
  const [isLoggedIn, setIsLoggedIn]         = useState(false)
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([])

  useEffect(() => {
    async function loadPricingOptions() {
      try {
        const response = await fetchCms<PricingResponse>('pricing')
        setPricingOptions(response.data.allPricingOptions)
      } catch (error) {
        console.error('Error fetching pricing options:', error)
      }
    }

    loadPricingOptions()

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })
    return () => unsubscribe()
  }, [])

  const handleBuyCredits = async (option: PricingOption) => {
    logEvent('begin_checkout', { credits: option.credits, value: option.price / 100, currency: 'USD' })
    const token     = await auth.currentUser?.getIdToken()
    const requestId = crypto.randomUUID()

    const paymentResponse = await fetch(
      `${import.meta.env.PUBLIC_BASE_FUNCTIONS_URL}/processPayment`,
      {
        method: 'POST',
        body: JSON.stringify({
          credits:     option.credits,
          amount:      option.price,
          quantity:    1,
          currency:    'usd',
          productName: option.productName,
          userId:      auth.currentUser?.uid,
          userEmail:   auth.currentUser?.email,
          requestId,
        }),
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const paymentData = await paymentResponse.json()
    if (paymentData.url) window.location.href = paymentData.url
  }

  if (pricingOptions.length === 0) return null

  return (
    <AutoGrid minColWidth="260px" gap={4}>
      {pricingOptions.map((option, i) => {
        const price      = `$${(option.price / 100).toFixed(2)}`
        const perCr      = (option.price / 100 / option.credits).toFixed(2)
        const isFeatured = i === 1

        return (
          <PriceCard
            key={option.id}
            credits={option.credits}
            price={price}
            priceNote={`$${perCr} per credit${isFeatured ? ' · save 17%' : i === 2 ? ' · save 33%' : ''}`}
            featured={isFeatured}
            operations={getOps(option.credits)}
            cta={
              isLoggedIn
                ? { label: 'Buy credits' }
                : { href: '/signup', label: isFeatured ? 'Buy credits' : 'Get started' }
            }
            onCtaClick={
              isLoggedIn
                ? (e) => { e.preventDefault(); handleBuyCredits(option); }
                : undefined
            }
            ctaVariant={isFeatured ? 'solid-terra' : 'ghost'}
          />
        )
      })}
    </AutoGrid>
  )
}
