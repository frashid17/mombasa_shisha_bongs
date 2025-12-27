'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'
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

interface BundlesGridProps {
  bundles: Bundle[]
}

export default function BundlesGrid({ bundles }: BundlesGridProps) {
  const { format } = useCurrency()

  if (bundles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bundles available</h3>
        <p className="text-gray-600 mb-6">Check back later for exciting new product bundles!</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bundles.map((bundle) => {
        const totalIndividualPrice = bundle.items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        )
        const savings = totalIndividualPrice - Number(bundle.price)
        const savingsPercent = ((savings / totalIndividualPrice) * 100).toFixed(0)

        return (
          <Link
            key={bundle.id}
            href={`/bundles/${bundle.id}`}
            className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-red-300 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            {/* Bundle Image */}
            {bundle.image && (
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <Image
                  src={bundle.image}
                  alt={bundle.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="p-6">
              {/* Bundle Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 flex-1 group-hover:text-red-600 transition-colors">{bundle.name}</h3>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold ml-2 whitespace-nowrap">
                    Save {savingsPercent}%
                  </span>
                </div>
                {bundle.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bundle.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 line-through text-sm">
                    {format(totalIndividualPrice)}
                  </span>
                  <span className="text-red-600 font-bold text-2xl">
                    {format(bundle.price)}
                  </span>
                </div>
              </div>

              {/* Bundle Items Preview */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Includes:</p>
                <div className="space-y-1">
                  {bundle.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>
                        {item.product.name}
                        {item.quantity > 1 && ` (x${item.quantity})`}
                      </span>
                    </div>
                  ))}
                  {bundle.items.length > 3 && (
                    <span className="text-sm text-gray-500">
                      +{bundle.items.length - 3} more items
                    </span>
                  )}
                </div>
              </div>

              {/* View Bundle Button */}
              <div className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg">
                View Bundle Details
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

