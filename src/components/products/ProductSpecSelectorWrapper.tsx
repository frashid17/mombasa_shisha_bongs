'use client'

import { useState } from 'react'
import SpecSelector from './SpecSelector'
import AddToCartButton from '@/components/cart/AddToCartButton'
import BuyNowButton from '@/components/cart/BuyNowButton'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
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

  const hasSpecs = specs.length > 0

  return (
    <div className="mt-6">
      {hasSpecs && (
        <div className="mb-4">
          <SpecSelector
            productId={productId}
            specs={specs}
            selectedSpecId={selectedSpecId}
            onSpecChange={setSelectedSpecId}
            required={true}
          />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <AddToCartButton 
          product={product} 
          selectedSpecId={selectedSpecId}
          specs={specs}
        />
        <BuyNowButton 
          product={product}
          selectedSpecId={selectedSpecId}
          specs={specs}
        />
      </div>
    </div>
  )
}

