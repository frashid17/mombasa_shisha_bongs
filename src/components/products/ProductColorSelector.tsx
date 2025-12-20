'use client'

import ColorSelector from './ColorSelector'

interface Color {
  id: string
  name: string
  value: string
  isActive: boolean
}

interface ProductColorSelectorProps {
  productId: string
  colors: Color[]
  selectedColorId?: string | null
  onColorChange: (colorId: string | null) => void
  required?: boolean
}

export default function ProductColorSelector({
  productId,
  colors,
  selectedColorId,
  onColorChange,
  required = false,
}: ProductColorSelectorProps) {
  if (colors.length === 0) {
    return null
  }

  return (
    <ColorSelector
      productId={productId}
      colors={colors}
      selectedColorId={selectedColorId}
      onColorChange={onColorChange}
      required={required}
    />
  )
}

