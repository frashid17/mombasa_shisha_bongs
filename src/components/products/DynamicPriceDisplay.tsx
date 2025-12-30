'use client'

import { useState, useEffect } from 'react'
import PriceDisplay from './PriceDisplay'
import { useProductPrice } from './ProductPriceWrapper'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  price: number | null
  isActive: boolean
}

interface DynamicPriceDisplayProps {
  basePrice: number
  compareAtPrice?: number | null
  specs: Specification[]
  selectedSpecId: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function DynamicPriceDisplay({
  basePrice,
  compareAtPrice,
  specs,
  selectedSpecId: propSelectedSpecId,
  size = 'xl',
}: DynamicPriceDisplayProps) {
  const [currentPrice, setCurrentPrice] = useState(basePrice)
  
  // Try to use context, fallback to prop
  let selectedSpecId = propSelectedSpecId
  try {
    const context = useProductPrice()
    selectedSpecId = context.selectedSpecId
  } catch {
    // Not within ProductPriceProvider, use prop
    selectedSpecId = propSelectedSpecId
  }

  useEffect(() => {
    if (selectedSpecId) {
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

  return (
    <PriceDisplay
      price={currentPrice}
      compareAtPrice={compareAtPrice}
      size={size}
    />
  )
}

