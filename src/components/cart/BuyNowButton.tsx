'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { Zap } from 'lucide-react'

interface Color {
  id: string
  name: string
  value: string
  isActive: boolean
}

export default function BuyNowButton({ 
  product, 
  colors = [],
  selectedColorId = null
}: { 
  product: any
  colors?: Color[]
  selectedColorId?: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (selectedColorId && colors.length > 0) {
      const color = colors.find(c => c.id === selectedColorId)
      setSelectedColor(color || null)
    } else {
      setSelectedColor(null)
    }
  }, [selectedColorId, colors])

  const handleBuyNow = () => {
    if (colors.length > 0 && !selectedColorId) {
      alert('Please select a color')
      return
    }

    setLoading(true)
    // Add item to cart
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      colorId: selectedColorId || null,
      colorName: selectedColor?.name || null,
      colorValue: selectedColor?.value || null,
    })
    // Redirect to checkout immediately
    setTimeout(() => {
      router.push('/checkout')
      setLoading(false)
    }, 100)
  }

  const hasColors = colors.length > 0
  const canBuy = !hasColors || (hasColors && selectedColorId)

  return (
    <button
      onClick={handleBuyNow}
      disabled={loading || product.stock === 0 || !canBuy}
      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Zap className="w-5 h-5" />
      {loading ? 'Processing...' : 'Buy Now'}
    </button>
  )
}

