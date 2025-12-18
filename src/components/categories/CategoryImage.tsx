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
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      unoptimized={unoptimized}
      onError={() => {
        setHasError(true)
      }}
    />
  )
}

