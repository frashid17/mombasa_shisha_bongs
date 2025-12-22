'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingCart, Heart, Star } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCurrency } from '@/contexts/CurrencyContext'
import PriceDisplay from './PriceDisplay'
import ProductColorSelectorWrapper from './ProductColorSelectorWrapper'

interface QuickViewModalProps {
  product: {
    id: string
    name: string
    price: number
    compareAtPrice?: number | null
    description?: string | null
    images: Array<{ url: string; altText?: string | null }>
    category: { name: string } | null
    stock: number
    brand?: string | null
    averageRating?: number
    reviewCount?: number
    colors?: Array<{ id: string; name: string; value: string; isActive: boolean }>
  }
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { format } = useCurrency()
  const addToCart = useCartStore((state) => state.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id))
  }, [product.id, isInWishlist])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
    })
  }

  const handleToggleWishlist = () => {
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
    })
    setIsWishlisted(!isWishlisted)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
              {product.images[selectedImageIndex] ? (
                <Image
                  src={product.images[selectedImageIndex].url}
                  alt={product.images[selectedImageIndex].altText || product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-blue-500'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {product.category && (
              <p className="text-sm text-blue-400 font-semibold">{product.category.name}</p>
            )}
            <h3 className="text-2xl font-bold text-white">{product.name}</h3>
            {product.brand && (
              <p className="text-sm text-gray-400">Brand: <span className="text-white">{product.brand}</span></p>
            )}

            {/* Rating */}
            {(product.averageRating || product.reviewCount) && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.averageRating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                {product.averageRating && (
                  <span className="text-sm text-gray-400">
                    {product.averageRating.toFixed(1)} ({product.reviewCount || 0} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div>
              <PriceDisplay
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
              />
            </div>

            {/* Stock Status */}
            <div>
              {product.stock > 0 ? (
                <p className="text-green-400 font-semibold">In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-red-400 font-semibold">Out of Stock</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
                <p className="text-sm text-gray-400 line-clamp-3">{product.description}</p>
              </div>
            )}

            {/* Actions */}
            {product.stock > 0 && (
              <div className="space-y-3 pt-4">
                {product.colors && product.colors.length > 0 ? (
                  <ProductColorSelectorWrapper
                    productId={product.id}
                    colors={product.colors}
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.images[0]?.url,
                    }}
                  />
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleToggleWishlist}
                      className={`p-3 rounded-lg border transition-colors ${
                        isWishlisted
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View Full Details Link */}
            <Link
              href={`/products/${product.id}`}
              onClick={onClose}
              className="block text-center text-blue-400 hover:text-blue-300 font-semibold text-sm pt-2"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

