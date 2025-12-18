'use client'

import { useEffect } from 'react'

export default function TrackProductView({ productId }: { productId: string }) {
  useEffect(() => {
    // Get or create session ID
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `guest-${Date.now()}`
      localStorage.setItem('sessionId', sessionId)
    }

    // Track product view
    fetch(`/api/products/${productId}/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {
      // Silently fail if tracking doesn't work
    })
  }, [productId])

  return null
}

