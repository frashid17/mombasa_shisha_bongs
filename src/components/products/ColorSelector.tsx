'use client'

import { useState, useEffect } from 'react'

interface Color {
  id: string
  name: string
  value: string
  isActive: boolean
}

interface ColorSelectorProps {
  productId: string
  colors: Color[]
  selectedColorId?: string | null
  onColorChange: (colorId: string | null) => void
  required?: boolean
}

export default function ColorSelector({
  productId,
  colors,
  selectedColorId,
  onColorChange,
  required = false,
}: ColorSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(selectedColorId || null)

  useEffect(() => {
    setSelectedId(selectedColorId || null)
  }, [selectedColorId])

  const activeColors = colors.filter(c => c.isActive)

  if (activeColors.length === 0) {
    return null
  }

  const handleColorSelect = (colorId: string) => {
    setSelectedId(colorId)
    onColorChange(colorId)
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Color {required && <span className="text-red-600">*</span>}
      </label>
      <div className="flex flex-wrap gap-3">
        {activeColors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => handleColorSelect(color.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
              ${
                selectedId === color.id
                  ? 'border-red-600 bg-red-50 shadow-lg shadow-red-500/30'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-400"
              style={{ 
                backgroundColor: color.value.startsWith('#') ? color.value : `#${color.value}`,
                minWidth: '24px',
                minHeight: '24px'
              }}
            />
            <span className={`font-medium ${selectedId === color.id ? 'text-red-600' : 'text-gray-900'}`}>{color.name}</span>
            {selectedId === color.id && (
              <svg
                className="w-5 h-5 text-red-600"
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
      {required && !selectedId && (
        <p className="text-red-600 text-sm mt-2">Please select a color</p>
      )}
    </div>
  )
}

