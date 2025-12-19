'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useCartStore } from '@/store/cartStore'

const ABANDONMENT_DELAY = 30 * 60 * 1000 // 30 minutes in milliseconds
const TRACKING_INTERVAL = 5 * 60 * 1000 // Check every 5 minutes

/**
 * Hook to track abandoned carts
 * Tracks cart abandonment after 30 minutes of inactivity
 */
export function useAbandonedCartTracking() {
  const { user } = useUser()
  const { items, getTotal } = useCartStore()
  const lastActivityRef = useRef<number>(Date.now())
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const trackedRef = useRef<boolean>(false)

  // Update last activity when cart changes
  useEffect(() => {
    if (items.length > 0) {
      lastActivityRef.current = Date.now()
      trackedRef.current = false // Reset tracking if cart is modified
    } else {
      // Clear tracking if cart is empty
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
        trackingIntervalRef.current = null
      }
      trackedRef.current = false
    }
  }, [items])

  // Start tracking when cart has items
  useEffect(() => {
    if (items.length === 0) {
      return
    }

    // Clear any existing interval
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
    }

    // Check periodically if cart should be marked as abandoned
    trackingIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current

      if (
        timeSinceLastActivity >= ABANDONMENT_DELAY &&
        !trackedRef.current &&
        items.length > 0
      ) {
        trackAbandonedCart()
        trackedRef.current = true
      }
    }, TRACKING_INTERVAL)

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
      }
    }
  }, [items.length, user?.id])

  const trackAbandonedCart = async () => {
    try {
      // Get session ID from localStorage or generate one
      let sessionId = localStorage.getItem('sessionId')
      if (!sessionId) {
        sessionId = `guest-${Date.now()}`
        localStorage.setItem('sessionId', sessionId)
      }

      // Get user email if available
      const email = user?.primaryEmailAddress?.emailAddress || null
      const phone = user?.primaryPhoneNumber?.phoneNumber || null

      // Only track if we have email or phone
      if (!email && !phone) {
        return
      }

      const cartData = JSON.stringify(items)
      const total = getTotal()

      // Only track if cart has items and total > 0
      if (items.length === 0 || total === 0) {
        return
      }

      await fetch('/api/abandoned-carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartData,
          email,
          phone,
          sessionId: user ? undefined : sessionId,
        }),
      })
    } catch (error) {
      console.error('Error tracking abandoned cart:', error)
    }
  }
}

