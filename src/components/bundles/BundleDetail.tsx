'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, ShoppingCart, ArrowRight, Check } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useRouter } from 'next/navigation'

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
    category?: { id: string; name: string; slug: string } | null
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

interface BundleDetailProps {
  bundle: Bundle
  totalIndividualPrice: number
  savings: number
  savingsPercent: string
}

export default function BundleDetail({
  bundle,
  totalIndividualPrice,
  savings,
  savingsPercent,
}: BundleDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { colorId?: string; specId?: string }>>({})
  const [imageError, setImageError] = useState(false)
  const { addBundle } = useCartStore()
  const { format } = useCurrency()
  const router = useRouter()

  // Initialize selected options with preselected values
  useEffect(() => {
    const initialOptions: Record<string, { colorId?: string; specId?: string }> = {}
    bundle.items.forEach((item) => {
      if (!item.allowColorSelection && item.colorId) {
        initialOptions[item.id] = { ...initialOptions[item.id], colorId: item.colorId }
      }
      if (!item.allowSpecSelection && item.specId) {
        initialOptions[item.id] = { ...initialOptions[item.id], specId: item.specId }
      }
    })
    if (Object.keys(initialOptions).length > 0) {
      setSelectedOptions(initialOptions)
    }
  }, [bundle.items])

  const updateSelection = (itemId: string, type: 'color' | 'spec', value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [type === 'color' ? 'colorId' : 'specId']: value,
      },
    }))
  }

  const handleAddToCart = () => {
    const bundleItems = bundle.items.map((item) => {
      const itemOptions = selectedOptions[item.id] || {}
      const colorId = item.allowColorSelection ? itemOptions.colorId : item.colorId
      const specId = item.allowSpecSelection ? itemOptions.specId : item.specId

      return {
        id: item.productId,
        productId: item.productId,
        colorId: colorId || null,
        specId: specId || null,
        quantity: item.quantity,
      }
    })

    addBundle({
      bundleId: bundle.id,
      name: bundle.name,
      price: bundle.price, // Bundle price (already discounted)
      image: bundle.image || undefined,
      bundleItems,
      bundleDiscount: bundle.discount || savings,
    })

    router.push('/cart')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Bundle Image */}
        <div className="relative">
          {bundle.image && bundle.image.trim() !== '' && !imageError ? (
            <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={bundle.image}
                alt={bundle.name}
                fill
                className="object-cover"
                priority
                unoptimized={true}
                onError={() => {
                  setImageError(true)
                }}
              />
            </div>
          ) : (
            <div className="w-full h-96 md:h-[500px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Bundle Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{bundle.name}</h1>
            {bundle.description && (
              <p className="text-lg text-gray-700 mb-6">{bundle.description}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-gray-500 line-through text-lg">
                {format(totalIndividualPrice)}
              </span>
              <span className="text-red-600 font-bold text-4xl">
                {format(bundle.price)}
              </span>
              <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-lg">
                Save {savingsPercent}%
              </span>
            </div>
            <p className="text-sm text-gray-700">
              You save <span className="font-bold text-red-600">{format(savings)}</span> when buying this bundle!
            </p>
          </div>

          {/* Bundle Items List */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bundle Includes:</h2>
            <div className="space-y-4">
              {bundle.items.map((item) => {
                const itemOptions = selectedOptions[item.id] || {}
                const selectedColorId = item.allowColorSelection ? itemOptions.colorId : item.colorId
                const selectedSpecId = item.allowSpecSelection ? itemOptions.specId : item.specId

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start gap-4">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="flex-shrink-0 hover:opacity-80"
                      >
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-lg font-bold text-gray-900 hover:text-red-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.category && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.product.category.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          Individual Price: {format(item.product.price)} {item.quantity > 1 && `× ${item.quantity}`}
                        </p>
                      </div>
                    </div>

                    {/* Color Selection */}
                    {item.allowColorSelection && item.product.colors && item.product.colors.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Choose Color: *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {item.product.colors.map((color) => (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => updateSelection(item.id, 'color', color.id)}
                              className={`px-4 py-2 text-sm border-2 rounded-lg transition-colors flex items-center gap-2 ${
                                selectedColorId === color.id
                                  ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                                  : 'border-gray-300 hover:border-red-300'
                              }`}
                            >
                              {color.value && (
                                <div
                                  className="w-5 h-5 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: color.value }}
                                />
                              )}
                              {color.name}
                              {selectedColorId === color.id && (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spec Selection */}
                    {item.allowSpecSelection && item.product.specifications && item.product.specifications.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Choose {item.product.specifications[0]?.type || 'Option'}: *
                        </label>
                        <select
                          value={selectedSpecId || ''}
                          onChange={(e) => updateSelection(item.id, 'spec', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required={item.allowSpecSelection}
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
                      <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                        <span className="font-semibold">Color:</span> {item.preselectedColor.name}
                      </div>
                    )}
                    {!item.allowSpecSelection && item.preselectedSpec && (
                      <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                        <span className="font-semibold">{item.preselectedSpec.type}:</span> {item.preselectedSpec.name}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={
              bundle.items.some((item) => {
                if (item.allowColorSelection && item.product.colors && item.product.colors.length > 0) {
                  const itemOptions = selectedOptions[item.id] || {}
                  return !itemOptions.colorId
                }
                if (item.allowSpecSelection && item.product.specifications && item.product.specifications.length > 0) {
                  const itemOptions = selectedOptions[item.id] || {}
                  return !itemOptions.specId
                }
                return false
              })
            }
            className="w-full flex items-center justify-center gap-3 bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-6 h-6" />
            Add Bundle to Cart
            <ArrowRight className="w-5 h-5" />
          </button>

          {bundle.items.some((item) => 
            (item.allowColorSelection && item.product.colors && item.product.colors.length > 0) ||
            (item.allowSpecSelection && item.product.specifications && item.product.specifications.length > 0)
          ) && (
            <p className="text-sm text-gray-500 text-center">
              * Please select all required options before adding to cart
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

