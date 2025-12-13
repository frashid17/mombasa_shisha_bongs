'use client'

import { useState, useEffect } from 'react'
import { useWishlistStore } from '@/store/wishlistStore'
import { Heart } from 'lucide-react'

export default function AddToWishlistButton({ product }: { product: any }) {
  const [loading, setLoading] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const { toggleItem, isInWishlist: checkWishlist } = useWishlistStore()

  useEffect(() => {
    setIsInWishlist(checkWishlist(product.id))
  }, [product.id, checkWishlist])

  const handleToggle = () => {
    setLoading(true)
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      slug: product.slug,
    })
    setTimeout(() => {
      setIsInWishlist(checkWishlist(product.id))
      setLoading(false)
    }, 200)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        isInWishlist
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`}
      />
      <span className="hidden sm:inline">
        {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </span>
    </button>
  )
}

