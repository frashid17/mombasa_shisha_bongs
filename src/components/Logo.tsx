'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  showText?: boolean
}

export default function Logo({ className = '', width = 40, height = 40, showText = true }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {!imageError ? (
        <Image
          src="/logo.png"
          alt="Mombasa Shisha Bongs Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-blue-400"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          MSB
        </div>
      )}
      {showText && (
        <span className="text-2xl font-bold text-white hover:text-blue-400 transition">
          Mombasa Shisha
        </span>
      )}
    </Link>
  )
}

