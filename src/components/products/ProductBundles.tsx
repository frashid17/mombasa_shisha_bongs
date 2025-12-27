'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCurrency } from '@/contexts/CurrencyContext'

interface BundleItem {
  id: string
  productId: string
  quantity: number
  colorId?: string | null
  specId?: string | null
  allowColorSelection: boolean
  allowSpecSelection: boolean
  product: {
    id: string
    name: string
    price: number
    image: string | null
    slug: string
    colors?: Array<{ id: string; name: string; value: string }>
    specifications?: Array<{ id: string; type: string; name: string; value: string | null }>
  }
  preselectedColor?: { id: string; name: string; value: string } | null
  preselectedSpec?: { id: string; type: string; name: string; value: string | null } | null
}

interface Bundle {
  id: string
  name: string
  description: string | null
  image: string | null
  price: number
  discount: number | null
  items: BundleItem[]
}

interface ProductBundlesProps {
  productId: string
}

export default function ProductBundles({ productId }: ProductBundlesProps) {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { colorId?: string; specId?: string }>>({})
  const { addItem } = useCartStore()
  const { format } = useCurrency()

  useEffect(() => {
    async function fetchBundles() {
      try {
        const res = await fetch('/api/bundles')
        if (!res.ok) {
          throw new Error('Failed to fetch bundles')
        }
        const data = await res.json()
        // Filter bundles that include this product
        const relevantBundles = data.bundles.filter((bundle: Bundle) =>
          bundle.items.some((item) => item.productId === productId)
        )
        setBundles(relevantBundles)
        
        // Initialize selected options with preselected values
        const initialOptions: Record<string, { colorId?: string; specId?: string }> = {}
        relevantBundles.forEach((bundle: Bundle) => {
          bundle.items.forEach((item) => {
            if (!item.allowColorSelection && item.colorId) {
              initialOptions[item.id] = { ...initialOptions[item.id], colorId: item.colorId }
            }
            if (!item.allowSpecSelection && item.specId) {
              initialOptions[item.id] = { ...initialOptions[item.id], specId: item.specId }
            }
          })
        })
        setSelectedOptions(initialOptions)
      } catch (error) {
        console.error('Error fetching bundles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBundles()
  }, [productId])

  const handleAddBundle = (bundle: Bundle) => {
    bundle.items.forEach((item) => {
      const options = selectedOptions[item.id] || {}
      const colorId = item.allowColorSelection ? options.colorId : item.colorId
      const specId = item.allowSpecSelection ? options.specId : item.specId
      
      // Find selected color and spec details
      const selectedColor = item.product.colors?.find(c => c.id === colorId)
      const selectedSpec = item.product.specifications?.find(s => s.id === specId)
      
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.productId,
          name: item.product.name,
          price: Number(item.product.price),
          image: item.product.image || undefined,
          colorId: colorId || undefined,
          colorName: selectedColor?.name || undefined,
          colorValue: selectedColor?.value || undefined,
          specId: specId || undefined,
          specType: selectedSpec?.type || undefined,
          specName: selectedSpec?.name || undefined,
          specValue: selectedSpec?.value || undefined,
        })
      }
    })
  }

  const updateSelection = (itemId: string, type: 'color' | 'spec', value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [type === 'color' ? 'colorId' : 'specId']: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (bundles.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-red-600" />
        <h2 className="text-xl font-bold text-gray-900">Available Bundles</h2>
      </div>

      <div className="space-y-4">
        {bundles.map((bundle) => {
          const totalIndividualPrice = bundle.items.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0
          )
          const savings = totalIndividualPrice - Number(bundle.price)
          const savingsPercent = ((savings / totalIndividualPrice) * 100).toFixed(0)

          return (
            <div
              key={bundle.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
            >
              {bundle.image && (
                <div className="mb-4">
                  <Image
                    src={bundle.image}
                    alt={bundle.name}
                    width={200}
                    height={150}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{bundle.name}</h3>
                  {bundle.description && (
                    <p className="text-sm text-gray-600 mb-2">{bundle.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 line-through">
                      KES {totalIndividualPrice.toLocaleString()}
                    </span>
                    <span className="text-red-600 font-bold text-lg">
                      {format(bundle.price)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-semibold">
                      Save {savingsPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Includes:</p>
                {bundle.items.map((item) => {
                  const itemOptions = selectedOptions[item.id] || {}
                  const selectedColorId = item.allowColorSelection ? itemOptions.colorId : item.colorId
                  const selectedSpecId = item.allowSpecSelection ? itemOptions.specId : item.specId

                  return (
                    <div
                      key={item.id}
                      className="p-3 border border-gray-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="flex items-center gap-2 flex-1 hover:opacity-80"
                        >
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500">x{item.quantity}</p>
                            )}
                          </div>
                        </Link>
                      </div>

                      {/* Color Selection */}
                      {item.allowColorSelection && item.product.colors && item.product.colors.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Choose Color:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {item.product.colors.map((color) => (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => updateSelection(item.id, 'color', color.id)}
                                className={`px-3 py-1.5 text-xs border-2 rounded-lg transition-colors ${
                                  selectedColorId === color.id
                                    ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                                    : 'border-gray-300 hover:border-red-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {color.value && (
                                    <div
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: color.value }}
                                    />
                                  )}
                                  {color.name}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Spec Selection */}
                      {item.allowSpecSelection && item.product.specifications && item.product.specifications.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Choose {item.product.specifications[0]?.type || 'Option'}:
                          </label>
                          <select
                            value={selectedSpecId || ''}
                            onChange={(e) => updateSelection(item.id, 'spec', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="">Select {item.product.specifications[0]?.type || 'option'}</option>
                            {item.product.specifications.map((spec) => (
                              <option key={spec.id} value={spec.id}>
                                {spec.name} {spec.value ? `(${spec.value})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Show preselected values */}
                      {!item.allowColorSelection && item.preselectedColor && (
                        <div className="text-xs text-gray-600">
                          Color: <span className="font-semibold">{item.preselectedColor.name}</span>
                        </div>
                      )}
                      {!item.allowSpecSelection && item.preselectedSpec && (
                        <div className="text-xs text-gray-600">
                          {item.preselectedSpec.type}: <span className="font-semibold">{item.preselectedSpec.name}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => handleAddBundle(bundle)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <ShoppingCart className="w-5 h-5" />
                Add Bundle to Cart
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
