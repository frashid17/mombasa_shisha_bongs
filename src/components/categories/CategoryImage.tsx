'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CategoryImageProps {
  src: string
  alt: string
  className?: string
  unoptimized?: boolean
}

export default function CategoryImage({ src, alt, className, unoptimized }: CategoryImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    )
  }

  return (
    <>
      {/* Loading placeholder */}
      <div
        className={`absolute inset-0 bg-gray-800 transition-opacity duration-300 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <Image
        src={src}
        alt={alt}
        fill
        className={`${className || ''} transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        unoptimized={unoptimized}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setHasError(true)
          setImageLoaded(false)
        }}
      />
    </>
  )
}

