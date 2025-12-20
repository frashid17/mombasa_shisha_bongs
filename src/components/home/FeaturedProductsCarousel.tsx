'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  images: Array<{ url: string; altText?: string | null }>
  category: { name: string }
  stock: number
  isFeatured?: boolean
}

interface FeaturedProductsCarouselProps {
  products: Product[]
}

export default function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || products.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, products.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10 seconds
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  if (products.length === 0) return null

  return (
    <section className="py-16 bg-gray-800 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Featured Products
              </h2>
              <p className="text-gray-400">Handpicked premium selections for you</p>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div className="relative h-[500px] overflow-hidden rounded-xl">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentIndex
                    ? 'opacity-100 translate-x-0'
                    : index < currentIndex
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <Link
                  href={`/products/${product.id}`}
                  className="block h-full bg-gray-900 rounded-xl overflow-hidden group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    {/* Image */}
                    <div className="relative h-full min-h-[300px] md:min-h-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText || product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col justify-center p-8 md:p-12 bg-gradient-to-br from-gray-900 to-gray-800">
                      <div className="mb-4">
                        <span className="inline-block bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                          FEATURED
                        </span>
                        {product.category && (
                          <p className="text-blue-400 font-semibold mb-2">{product.category.name}</p>
                        )}
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-4xl md:text-5xl font-bold text-blue-400 mb-6">
                          KES {product.price.toLocaleString()}
                        </p>
                        {product.stock > 0 ? (
                          <span className="inline-block bg-green-900 text-green-400 text-sm px-3 py-1 rounded-full border border-green-700">
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-block bg-red-900 text-red-400 text-sm px-3 py-1 rounded-full border border-red-700">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <button className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all w-fit">
                        Shop Now →
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {products.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                aria-label="Next product"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {products.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-purple-500'
                      : 'w-3 bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

