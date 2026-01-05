'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCurrency } from '@/contexts/CurrencyContext'
import toast from 'react-hot-toast'
import AddToCartButton from '@/components/cart/AddToCartButton'
import AddToWishlistButton from '@/components/wishlist/AddToWishlistButton'

interface StickyAddToCartBarProps {
  product: {
    id: string
    name: string
    price: number
    compareAtPrice?: number | null
    images: Array<{ url: string; altText?: string | null }>
    stock: number
    slug?: string
  }
  currentPrice: number
  isVisible: boolean
}

export default function StickyAddToCartBar({
  product,
  currentPrice,
  isVisible,
}: StickyAddToCartBarProps) {
  const { format } = useCurrency()

  if (!isVisible || product.stock === 0) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ marginBottom: '80px' }} // Space for FloatingContactButtons (2 buttons + gap = ~80px)
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Product Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {product.images[0] && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={product.images[0].url}
                  alt={product.images[0].altText || product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
              <p className="text-lg font-bold text-red-600">{format(currentPrice)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <AddToWishlistButton
              product={{
                id: product.id,
                name: product.name,
                price: currentPrice,
                images: product.images || [],
                slug: product.slug,
              }}
            />
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: currentPrice,
                images: product.images || [],
                stock: product.stock,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

