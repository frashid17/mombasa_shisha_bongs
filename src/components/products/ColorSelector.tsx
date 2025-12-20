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
      <label className="block text-sm font-semibold text-white mb-3">
        Color {required && <span className="text-red-400">*</span>}
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
                  ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }
            `}
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-400"
              style={{ backgroundColor: color.value }}
            />
            <span className="text-white font-medium">{color.name}</span>
            {selectedId === color.id && (
              <svg
                className="w-5 h-5 text-blue-400"
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
        <p className="text-red-400 text-sm mt-2">Please select a color</p>
      )}
    </div>
  )
}

