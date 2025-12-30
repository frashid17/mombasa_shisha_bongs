'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import DynamicPriceDisplay from './DynamicPriceDisplay'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  price: number | null
  isActive: boolean
}

interface ProductPriceContextType {
  selectedSpecId: string | null
  setSelectedSpecId: (specId: string | null) => void
}

const ProductPriceContext = createContext<ProductPriceContextType | undefined>(undefined)

export const useProductPrice = () => {
  const context = useContext(ProductPriceContext)
  if (!context) {
    throw new Error('useProductPrice must be used within ProductPriceProvider')
  }
  return context
}

interface ProductPriceWrapperProps {
  basePrice: number
  compareAtPrice?: number | null
  specs: Specification[]
  children?: ReactNode
}

export default function ProductPriceWrapper({
  basePrice,
  compareAtPrice,
  specs,
  children,
}: ProductPriceWrapperProps) {
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null)

  return (
    <ProductPriceContext.Provider value={{ selectedSpecId, setSelectedSpecId }}>
      <>
        {!children && (
          <div className="mb-6">
            <DynamicPriceDisplay
              basePrice={basePrice}
              compareAtPrice={compareAtPrice}
              specs={specs}
              selectedSpecId={selectedSpecId}
              size="xl"
            />
          </div>
        )}
        {children}
      </>
    </ProductPriceContext.Provider>
  )
}

