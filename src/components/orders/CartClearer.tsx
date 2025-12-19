'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'

interface CartClearerProps {
  paymentStatus: string
  paymentMethod?: string
}

/**
 * Component to clear cart after successful payment
 * Clears cart when payment status is PAID
 */
export default function CartClearer({ paymentStatus }: CartClearerProps) {
  const clearCart = useCartStore((state) => state.clearCart)
  const hasCleared = useRef(false) // Prevent clearing multiple times

  useEffect(() => {
    // Clear cart if payment is successful and hasn't been cleared yet
    if (paymentStatus === 'PAID' && !hasCleared.current) {
      clearCart()
      hasCleared.current = true
      console.log('🛒 Cart cleared after successful payment')
    }
  }, [paymentStatus, clearCart])

  return null // This component doesn't render anything
}

