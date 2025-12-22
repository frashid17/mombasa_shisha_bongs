'use client'

import { useState, useEffect } from 'react'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  isActive: boolean
}

interface SpecSelectorProps {
  productId: string
  specs: Specification[]
  selectedSpecId: string | null
  onSpecChange: (specId: string | null) => void
  required?: boolean
}

export default function SpecSelector({
  productId,
  specs,
  selectedSpecId,
  onSpecChange,
  required = false,
}: SpecSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(selectedSpecId || null)

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
  }

  return (
    <div className="mb-6 space-y-4">
      {Object.entries(specsByType).map(([type, typeSpecs]) => (
        <div key={type}>
          <label className="block text-sm font-semibold text-white mb-3">
            {type} {required && <span className="text-red-400">*</span>}
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
                      ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30 text-white'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500 text-gray-300'
                  }
                `}
              >
                {spec.name}
                {spec.value && (
                  <span className="text-xs opacity-75 ml-1">({spec.value})</span>
                )}
                {selectedId === spec.id && (
                  <svg
                    className="w-4 h-4 inline ml-2 text-blue-400"
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
        <p className="text-red-400 text-sm mt-2">Please select a specification</p>
      )}
    </div>
  )
}

