'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart } from 'lucide-react'

interface Color {
  id: string
  name: string
  value: string
  isActive: boolean
}

export default function AddToCartButton({ 
  product, 
  colors = [],
  selectedColorId = null,
  selectedSpecId = null,
  specs = []
}: { 
  product: any
  colors?: Color[]
  selectedColorId?: string | null
  selectedSpecId?: string | null
  specs?: Array<{ id: string; type: string; name: string; value: string | null }>
}) {
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<any>(null)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (selectedColorId && colors.length > 0) {
      const color = colors.find(c => c.id === selectedColorId)
      setSelectedColor(color || null)
    } else {
      setSelectedColor(null)
    }
  }, [selectedColorId, colors])

  useEffect(() => {
    if (selectedSpecId && specs.length > 0) {
      const spec = specs.find(s => s.id === selectedSpecId)
      setSelectedSpec(spec || null)
    } else {
      setSelectedSpec(null)
    }
  }, [selectedSpecId, specs])

  const handleAdd = () => {
    if (colors.length > 0 && !selectedColorId) {
      alert('Please select a color')
      return
    }
    if (specs.length > 0 && !selectedSpecId) {
      alert('Please select a specification')
      return
    }

    setLoading(true)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      colorId: selectedColorId || null,
      colorName: selectedColor?.name || null,
      colorValue: selectedColor?.value || null,
      specId: selectedSpecId || null,
      specType: selectedSpec?.type || null,
      specName: selectedSpec?.name || null,
      specValue: selectedSpec?.value || null,
    })
    setTimeout(() => setLoading(false), 300)
  }

  const hasColors = colors.length > 0
  const hasSpecs = specs.length > 0
  const canAdd = (!hasColors || (hasColors && selectedColorId)) && 
                 (!hasSpecs || (hasSpecs && selectedSpecId))

  return (
    <button
      onClick={handleAdd}
      disabled={loading || product.stock === 0 || !canAdd}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingCart className="w-5 h-5" />
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}

