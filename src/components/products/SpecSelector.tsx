'use client'

import { useState, useEffect } from 'react'
import { useCurrency } from '@/contexts/CurrencyContext'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  price: number | null
  isActive: boolean
}

interface SpecSelectorProps {
  productId: string
  specs: Specification[]
  selectedSpecId: string | null
  onSpecChange: (specId: string | null) => void
  onPriceChange?: (price: number | null) => void
  required?: boolean
}

export default function SpecSelector({
  productId,
  specs,
  selectedSpecId,
  onSpecChange,
  onPriceChange,
  required = false,
}: SpecSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(selectedSpecId || null)
  const { format } = useCurrency()
  
  // Types that allow pricing
  const priceAllowedTypes = ['Size', 'Weight', 'Volume']

  useEffect(() => {
    setSelectedId(selectedSpecId || null)
  }, [selectedSpecId])

  // Group specs by type
  const specsByType = specs
    .filter(s => s.isActive)
    .reduce((acc, spec) => {
      if (!acc[spec.type]) acc[spec.type] = []
      acc[spec.type].push(spec)
      return acc
    }, {} as Record<string, Specification[]>)

  if (Object.keys(specsByType).length === 0) {
    return null
  }

  const handleSpecSelect = (specId: string) => {
    setSelectedId(specId)
    onSpecChange(specId)
    
    // Notify parent of price change if callback provided
    if (onPriceChange) {
      const selectedSpec = specs.find(s => s.id === specId)
      onPriceChange(selectedSpec?.price ?? null)
    }
  }

  return (
    <div className="mb-6 space-y-4">
      {Object.entries(specsByType).map(([type, typeSpecs]) => (
        <div key={type}>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            {type} {required && <span className="text-red-600">*</span>}
          </label>
          <div className="flex flex-wrap gap-3">
            {typeSpecs.map((spec) => (
              <button
                key={spec.id}
                type="button"
                onClick={() => handleSpecSelect(spec.id)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all font-medium
                  ${
                    selectedId === spec.id
                      ? 'border-red-600 bg-red-50 shadow-lg shadow-red-500/30 text-red-600'
                      : 'border-gray-300 bg-white hover:border-gray-400 text-gray-900'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span>{spec.name}</span>
                  {spec.value && (
                    <span className="text-xs opacity-75">({spec.value})</span>
                  )}
                  {spec.price !== null && priceAllowedTypes.includes(spec.type) && (
                    <span className="text-xs font-semibold text-green-600 ml-1">
                      {format(spec.price)}
                    </span>
                  )}
                </div>
                {selectedId === spec.id && (
                  <svg
                    className="w-4 h-4 inline ml-2 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
      {required && !selectedId && (
        <p className="text-red-600 text-sm mt-2">Please select a specification</p>
      )}
    </div>
  )
}

