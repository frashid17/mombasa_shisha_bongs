'use client'

import { useState } from 'react'
import ProductColorSelector from './ProductColorSelector'
import AddToCartButton from '@/components/cart/AddToCartButton'
import BuyNowButton from '@/components/cart/BuyNowButton'

interface Color {
  id: string
  name: string
  value: string
  isActive: boolean
}

interface ProductColorSelectorWrapperProps {
  productId: string
  colors: Color[]
  product: any
}

export default function ProductColorSelectorWrapper({
  productId,
  colors,
  product,
}: ProductColorSelectorWrapperProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)

  const hasColors = colors.length > 0

  return (
    <div className="mt-6">
      {hasColors && (
        <div className="mb-4">
          <ProductColorSelector
            productId={productId}
            colors={colors}
            selectedColorId={selectedColorId}
            onColorChange={setSelectedColorId}
            required={true}
          />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <AddToCartButton 
          product={product} 
          colors={colors}
          selectedColorId={selectedColorId}
        />
        <BuyNowButton 
          product={product}
          colors={colors}
          selectedColorId={selectedColorId}
        />
      </div>
    </div>
  )
}

