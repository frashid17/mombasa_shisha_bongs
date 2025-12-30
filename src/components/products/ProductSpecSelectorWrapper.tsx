'use client'

import { useState, useEffect } from 'react'
import SpecSelector from './SpecSelector'
import AddToCartButton from '@/components/cart/AddToCartButton'
import BuyNowButton from '@/components/cart/BuyNowButton'
import { useProductPrice } from './ProductPriceWrapper'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  price: number | null
  isActive: boolean
}

interface ProductSpecSelectorWrapperProps {
  productId: string
  specs: Specification[]
  product: any
}

export default function ProductSpecSelectorWrapper({
  productId,
  specs,
  product,
}: ProductSpecSelectorWrapperProps) {
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null)
  const [specPrice, setSpecPrice] = useState<number | null>(null)
  const { setSelectedSpecId: setContextSpecId } = useProductPrice()

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
          selectedSpecId={selectedSpecId}
          specs={specs}
          overridePrice={specPrice}
        />
        <BuyNowButton 
          product={product}
          selectedSpecId={selectedSpecId}
          specs={specs}
          overridePrice={specPrice}
        />
      </div>
    </div>
  )
}

