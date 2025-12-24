'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCurrency } from '@/contexts/CurrencyContext'

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
  const { format } = useCurrency()

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
          <div
            key={product.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
          >
            <Link href={`/products/${product.id}`} className="relative h-64 bg-white overflow-hidden">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-full bg-gray-50 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
            </Link>
            <div className="p-4 bg-white flex-1 flex flex-col">
              <Link href={`/products/${product.id}`}>
                <h3 className="font-bold text-gray-900 mb-3 text-base line-clamp-2 hover:text-red-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 font-bold text-lg">{format(Number(product.price))}</p>
                  {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                    <p className="text-red-600 text-sm line-through">
                      Was {format(Number(product.compareAtPrice))}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={product.stock === 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={(e) => handleToggleWishlist(product, e)}
                  className={`inline-flex items-center justify-center p-2.5 rounded-md border transition-all ${
                    inWishlist
                      ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


