'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'

interface CartClearerProps {
  paymentStatus: string
  paymentMethod?: string
  orderId: string
}

/**
 * Component to clear cart after successful payment
 * This is a backup - cart is already cleared when order is created
 * Clears cart when payment status becomes PAID
 */
export default function CartClearer({ paymentStatus }: CartClearerProps) {
  const clearCart = useCartStore((state) => state.clearCart)
  const hasCleared = useRef(false) // Prevent clearing multiple times

  useEffect(() => {
    // Clear cart if payment is successful (backup mechanism)
    // Note: Cart is already cleared when order is created in checkout
    if (paymentStatus === 'PAID' && !hasCleared.current) {
      clearCart()
      hasCleared.current = true
      console.log('🛒 Cart cleared after successful payment (backup)')
    }
  }, [paymentStatus, clearCart])

  return null // This component doesn't render anything
}

