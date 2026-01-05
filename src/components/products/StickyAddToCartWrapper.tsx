'use client'

import { useEffect, useState } from 'react'
import { useProductPrice } from '@/components/products/ProductPriceWrapper'
import StickyAddToCartBar from './StickyAddToCartBar'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  price: number | null
  isActive: boolean
}

interface StickyAddToCartWrapperProps {
  product: {
    id: string
    name: string
    price: number
    compareAtPrice?: number | null
    images: Array<{ url: string; altText?: string | null }>
    stock: number
    slug?: string
  }
  basePrice: number
  specs?: Specification[]
}

export default function StickyAddToCartWrapper({
  product,
  basePrice,
  specs = [],
}: StickyAddToCartWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(basePrice)
  
  // Try to get selected spec from context
  let selectedSpecId: string | null = null
  try {
    const context = useProductPrice()
    selectedSpecId = context.selectedSpecId
  } catch {
    // Context not available
  }

  // Calculate current price based on selected spec
  useEffect(() => {
    if (selectedSpecId && specs.length > 0) {
      const selectedSpec = specs.find(s => s.id === selectedSpecId)
      if (selectedSpec && selectedSpec.price !== null) {
        setCurrentPrice(selectedSpec.price)
      } else {
        setCurrentPrice(basePrice)
      }
    } else {
      setCurrentPrice(basePrice)
    }
  }, [selectedSpecId, specs, basePrice])

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling 300px
      const scrollY = window.scrollY || window.pageYOffset
      setIsVisible(scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <StickyAddToCartBar
      product={product}
      currentPrice={currentPrice}
      isVisible={isVisible}
    />
  )
}

