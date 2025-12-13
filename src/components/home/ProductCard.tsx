'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    compareAtPrice?: number | null
    images: Array<{ url: string; altText?: string | null }>
    category: { name: string }
    stock: number
    isFeatured?: boolean
    isNewArrival?: boolean
  }
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - product.price) / Number(product.compareAtPrice)) * 100)
    : 0

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative bg-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
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
            <div
              className={`absolute inset-0 bg-gray-800 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-0' : 'opacity-100'
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
        <div className="absolute bottom-3 right-3 z-20">
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
      <div className="p-5">
        <p className="text-sm text-blue-400 font-semibold mb-1">{product.category.name}</p>
        <h3 className="font-semibold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-blue-400 font-bold text-xl">KES {product.price.toLocaleString()}</p>
            {hasDiscount && (
              <p className="text-gray-500 text-sm line-through">
                KES {Number(product.compareAtPrice).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

