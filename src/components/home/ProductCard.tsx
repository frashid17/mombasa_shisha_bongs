'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Sparkles, ShoppingCart, Heart } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import ProductBadges from '@/components/products/ProductBadges'
import StockProgressBar from '@/components/products/StockProgressBar'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  price: number | null
  isActive: boolean
}

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
    specifications?: Specification[]
    createdAt?: Date | string
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
  // The format function now uses formatCurrency consistently on both server and client
  const { format } = useCurrency()
  
  // Calculate display price - use lowest spec price if available, otherwise base price
  const priceAllowedTypes = ['Size', 'Weight', 'Volume']
  const specPrices = product.specifications
    ?.filter(s => s.isActive && priceAllowedTypes.includes(s.type) && s.price !== null)
    .map(s => s.price!) || []
  
  const lowestSpecPrice = specPrices.length > 0 ? Math.min(...specPrices) : null
  const displayPrice = lowestSpecPrice !== null ? lowestSpecPrice : product.price
  
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > displayPrice)
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - displayPrice) / Number(product.compareAtPrice)) * 100)
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

  const handleQuickBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) return

    // Check if product has specifications
    const hasSpecs = product.specifications && product.specifications.length > 0
    
    if (hasSpecs) {
      // Product has specs, redirect to product page to select them
      window.location.href = `/products/${product.id}`
      return
    }

    // Product has no specs, add to cart and go to checkout
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.images[0]?.url,
    })

    // Redirect to checkout
    window.location.href = '/checkout'
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
    <div className="group relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="relative h-64 bg-white overflow-hidden">
        {/* Badges */}
        <ProductBadges
          isNewArrival={product.isNewArrival}
          isFeatured={product.isFeatured}
          hasDiscount={hasDiscount}
          stock={product.stock}
          compareAtPrice={product.compareAtPrice}
          price={displayPrice}
          createdAt={product.createdAt}
        />
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
              className={`object-contain transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="h-full bg-gray-50 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </Link>

      {/* Product Info - VapeSoko Style */}
      <div className="p-4 bg-white flex flex-col flex-1">
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-3 text-base line-clamp-2 hover:text-red-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price - VapeSoko Style */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <p className="text-gray-900 font-bold text-lg">{format(displayPrice)}</p>
            {hasDiscount && (
              <p className="text-red-600 text-sm line-through">
                Was {format(Number(product.compareAtPrice))}
              </p>
            )}
          </div>
        </div>

        {/* Stock Progress Bar */}
        {product.stock > 0 && (
          <div className="mb-3">
            <StockProgressBar stock={product.stock} showText={false} />
          </div>
        )}

        {/* Action Buttons - Add to Cart, Buy Now, and Wishlist */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAddToCart}
              disabled={product.stock === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2.5 rounded-md text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`inline-flex items-center justify-center p-2.5 rounded-md border transition-all duration-300 ${
                wishlistActive
                  ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600'
              }`}
              aria-label={wishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${wishlistActive ? 'fill-current' : ''}`} />
            </button>
          </div>
          <button
            onClick={handleQuickBuyNow}
            disabled={product.stock === 0}
            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2.5 rounded-md text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}

