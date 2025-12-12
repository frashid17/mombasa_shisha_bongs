'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { Zap } from 'lucide-react'

export default function BuyNowButton({ product }: { product: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const handleBuyNow = () => {
    setLoading(true)
    // Add item to cart
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
    })
    // Redirect to checkout immediately
    setTimeout(() => {
      router.push('/checkout')
      setLoading(false)
    }, 100)
  }

  return (
    <button
      onClick={handleBuyNow}
      disabled={loading || product.stock === 0}
      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Zap className="w-5 h-5" />
      {loading ? 'Processing...' : 'Buy Now'}
    </button>
  )
}

