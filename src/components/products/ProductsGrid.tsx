'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart } from 'lucide-react'
import PriceDisplay from '@/components/products/PriceDisplay'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

interface ProductsGridProps {
  products: Array<{
    id: string
    name: string
    price: number
    compareAtPrice?: number | null
    images: Array<{ url: string }>
    category: { name: string }
    stock: number
    slug?: string
  }>
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  const addToCart = useCartStore((state) => state.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()

  const handleAddToCart = async (product: any, e: React.MouseEvent) => {
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
      price: Number(product.price),
      image: product.images[0]?.url,
    })
  }

  const handleToggleWishlist = (product: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0]?.url,
      slug: product.slug,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const inWishlist = isInWishlist(product.id)

        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all group"
          >
            {product.images[0] ? (
              <div className="relative h-64 bg-gray-800">
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-gray-700 to-gray-800" />
            )}
            <div className="p-5">
              {product.category && (
                <p className="text-sm text-blue-400 font-semibold mb-1">
                  {product.category.name}
                </p>
              )}
              <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mb-3">
                <PriceDisplay
                  price={Number(product.price)}
                  compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
                  size="lg"
                />
                {product.stock > 0 ? (
                  <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-full border border-green-700">
                    In Stock
                  </span>
                ) : (
                  <span className="text-xs bg-red-900 text-red-400 px-2 py-1 rounded-full border border-red-700">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={product.stock === 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={(e) => handleToggleWishlist(product, e)}
                  className={`inline-flex items-center justify-center px-3 py-2 rounded-lg border text-sm ${
                    inWishlist
                      ? 'bg-red-600 border-red-500 text-white hover:bg-red-700'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  } transition-colors`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}


