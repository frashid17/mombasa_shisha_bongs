'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Sparkles, ShoppingCart, Heart } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    compareAtPrice?: number | null
    images: Array<{ url: string; altText?: string | null }>
    category: { name: string } | null
    stock: number
    isFeatured?: boolean
    isNewArrival?: boolean
    slug?: string
    averageRating?: number
    reviewCount?: number
  }
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const addToCart = useCartStore((state) => state.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const [wishlistActive, setWishlistActive] = useState(false)

  useEffect(() => {
    setMounted(true)
    setWishlistActive(isInWishlist(product.id))
  }, [product.id, isInWishlist])
  
  // Use currency hook - it should always be available from CurrencyProvider in layout
  const { format } = useCurrency()
  
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - product.price) / Number(product.compareAtPrice)) * 100)
    : 0

  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) return

    // Check if product has required colors or specs
    try {
      const res = await fetch(`/api/products/${product.id}/has-options`)
      if (res.ok) {
        const data = await res.json()
        if (data.hasColors || data.hasSpecs) {
          // Product has required options, redirect to product page
          window.location.href = `/products/${product.id}`
          return
        }
      }
    } catch (error) {
      console.error('Error checking product options:', error)
      // If check fails, allow adding (fallback behavior)
    }

    // Product has no required options, add directly
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      slug: product.slug,
    })
    setWishlistActive(isInWishlist(product.id))
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative bg-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-visible sm:overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up flex flex-col h-full"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {product.isNewArrival && (
          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            NEW
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            FEATURED
          </span>
        )}
        {hasDiscount && (
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative h-64 bg-gray-800 overflow-hidden">
        {product.images[0] ? (
          <>
            {/* Skeleton shimmer while image loads */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-0' : 'opacity-100 skeleton'
              }`}
            />
            <Image
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
              fill
              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Stock Badge */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end gap-2">
          {product.stock > 0 ? (
            <span className="bg-green-900/90 text-green-400 text-xs font-semibold px-2 py-1 rounded-full border border-green-700 backdrop-blur-sm">
              In Stock
            </span>
          ) : (
            <span className="bg-red-900/90 text-red-400 text-xs font-semibold px-2 py-1 rounded-full border border-red-700 backdrop-blur-sm">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 pb-4 sm:pb-5">
        {product.category && (
          <p className="text-xs sm:text-sm text-blue-400 font-semibold mb-1">{product.category.name}</p>
        )}
        <h3 className="font-semibold text-white mb-2 sm:mb-3 line-clamp-2 text-sm sm:text-base group-hover:text-blue-400 transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
          {product.name}
        </h3>
        <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
          {/* Rating row */}
          {product.averageRating !== undefined && product.reviewCount !== undefined && product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= Math.round(product.averageRating ?? 0)
                        ? 'text-yellow-400'
                        : 'text-gray-600'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="ml-1">
                {product.averageRating?.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-blue-400 font-bold text-lg sm:text-xl leading-tight">{format(product.price)}</p>
              {hasDiscount && (
                <p className="text-gray-500 text-xs sm:text-sm leading-tight line-through">
                  {format(Number(product.compareAtPrice))}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
          <button
            onClick={handleQuickAddToCart}
            disabled={product.stock === 0}
            className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-0"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate hidden sm:inline">Add to Cart</span>
            <span className="truncate sm:hidden">Add</span>
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`inline-flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm flex-shrink-0 ${
              wishlistActive
                ? 'bg-red-600 border-red-500 text-white hover:bg-red-700'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            } transition-colors`}
            aria-label={wishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlistActive ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </Link>
  )
}

