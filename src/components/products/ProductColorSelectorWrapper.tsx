'use client'

import { useState, useEffect } from 'react'
import ProductColorSelector from './ProductColorSelector'
import SpecSelector from './SpecSelector'
import AddToCartButton from '@/components/cart/AddToCartButton'
import BuyNowButton from '@/components/cart/BuyNowButton'
import { useProductPrice } from './ProductPriceWrapper'

interface Color {
  id: string
  name: string
  value: string
  isActive: boolean
}

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  price: number | null
  isActive: boolean
}

interface ProductColorSelectorWrapperProps {
  productId: string
  colors: Color[]
  product: any
  specs?: Specification[]
}

export default function ProductColorSelectorWrapper({
  productId,
  colors,
  product,
  specs = [],
}: ProductColorSelectorWrapperProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null)
  const [specPrice, setSpecPrice] = useState<number | null>(null)
  const { setSelectedSpecId: setContextSpecId } = useProductPrice()

  const hasColors = colors.length > 0
  const hasSpecs = specs.length > 0

  const handleSpecChange = (specId: string | null) => {
    setSelectedSpecId(specId)
    setContextSpecId(specId)
  }

  useEffect(() => {
    if (selectedSpecId) {
      const selectedSpec = specs.find(s => s.id === selectedSpecId)
      setSpecPrice(selectedSpec?.price ?? null)
    } else {
      setSpecPrice(null)
    }
  }, [selectedSpecId, specs])

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
      {hasSpecs && (
        <div className="mb-4">
          <SpecSelector
            productId={productId}
            specs={specs}
            selectedSpecId={selectedSpecId}
            onSpecChange={handleSpecChange}
            onPriceChange={setSpecPrice}
            required={true}
          />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <AddToCartButton 
          product={product} 
          colors={colors}
          selectedColorId={selectedColorId}
          selectedSpecId={selectedSpecId}
          specs={specs}
          overridePrice={specPrice}
        />
        <BuyNowButton 
          product={product}
          colors={colors}
          selectedColorId={selectedColorId}
          selectedSpecId={selectedSpecId}
          specs={specs}
          overridePrice={specPrice}
        />
      </div>
    </div>
  )
}

