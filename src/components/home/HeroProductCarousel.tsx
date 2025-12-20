'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

interface Product {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  images: Array<{ url: string; altText?: string | null }>
  category: { name: string }
  stock: number
}

interface HeroProductCarouselProps {
  products: Product[]
}

export default function HeroProductCarousel({ products }: HeroProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { format } = useCurrency()

  // Number of products to show at once based on screen size
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth >= 1024) return 4 // lg
    if (window.innerWidth >= 768) return 3 // md
    return 2 // sm
  }

  const [visibleCount, setVisibleCount] = useState(getVisibleCount)

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || products.length <= visibleCount) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, products.length - visibleCount)
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, products.length, visibleCount])

  // Scroll to current index
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.scrollWidth / products.length
      scrollContainerRef.current.scrollTo({
        left: currentIndex * cardWidth * visibleCount,
        behavior: 'smooth',
      })
    }
  }, [currentIndex, products.length, visibleCount])

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - visibleCount)
      return prev <= 0 ? maxIndex : prev - 1
    })
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - visibleCount)
      return prev >= maxIndex ? 0 : prev + 1
    })
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  if (products.length === 0) return null

  const maxIndex = Math.max(0, products.length - visibleCount)
  const hasDiscount = (product: Product) => 
    product.compareAtPrice && product.compareAtPrice > product.price

  return (
    <div className="relative mt-8 md:mt-12">
      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-hidden scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, index) => {
            const discountPercent = hasDiscount(product)
              ? Math.round(((Number(product.compareAtPrice) - product.price) / Number(product.compareAtPrice)) * 100)
              : 0

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex-shrink-0 w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] group"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: 'transform 0.5s ease-in-out',
                }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all hover:scale-105">
                  {/* Image */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    {product.images[0] ? (
                      <>
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText || product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {hasDiscount(product) && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{discountPercent}%
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-xs text-blue-300 font-semibold mb-1 line-clamp-1">
                      {product.category.name}
                    </p>
                    <h3 className="text-sm md:text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-yellow-400">
                        {format(product.price)}
                      </p>
                      {hasDiscount(product) && (
                        <p className="text-sm text-gray-400 line-through">
                          {format(Number(product.compareAtPrice))}
                        </p>
                      )}
                    </div>
                    {product.stock > 0 ? (
                      <span className="inline-block mt-2 bg-green-900/50 text-green-300 text-xs px-2 py-1 rounded-full border border-green-700">
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-block mt-2 bg-red-900/50 text-red-300 text-xs px-2 py-1 rounded-full border border-red-700">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Navigation Arrows */}
        {products.length > visibleCount && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 z-10 hidden md:flex items-center justify-center"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 z-10 hidden md:flex items-center justify-center"
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {products.length > visibleCount && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white/80'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

