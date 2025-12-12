'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart } from 'lucide-react'

export default function AddToCartButton({ product }: { product: any }) {
  const [loading, setLoading] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAdd = () => {
    setLoading(true)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
    })
    setTimeout(() => setLoading(false), 300)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading || product.stock === 0}
      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingCart className="w-5 h-5" />
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}

