'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImage {
  url: string
  altText?: string | null
}

interface ProductImageCarouselProps {
  images: ProductImage[]
  productName: string
}

export default function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Auto-play carousel (optional - can be enabled)
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, images.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      // Swipe left - next image
      goToNext()
    } else if (distance < -minSwipeDistance) {
      // Swipe right - previous image
      goToPrevious()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-800">
        <Image
          src={images[0].url}
          alt={images[0].altText || productName}
          fill
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Main Image Display */}
      <div
        className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-800 group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={image.url}
              alt={image.altText || `${productName} - Image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-500/50'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.altText || `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Swipe Indicators for Mobile */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-gray-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

