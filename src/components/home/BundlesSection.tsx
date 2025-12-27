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

interface BundlesSectionProps {
  bundles: Bundle[]
}

export default function BundlesSection({ bundles }: BundlesSectionProps) {
  const { format } = useCurrency()

  if (bundles.length === 0) {
    return null
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-3 rounded-lg">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-3">
                Special Bundles
              </h2>
              <p className="text-gray-700 text-lg md:text-xl font-semibold">Save more with our curated bundles</p>
            </div>
          </div>
          <Link
            href="/bundles"
            className="text-red-600 font-bold hover:text-red-700 transition-colors flex items-center gap-2 text-sm md:text-base hover:scale-110 transform duration-300"
          >
            View All Bundles <span className="text-xl">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.slice(0, 6).map((bundle) => {
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
                  <div className="relative w-full h-48 overflow-hidden">
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
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold ml-2">
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
                    <p className="text-xs font-semibold text-gray-700 mb-2">Includes:</p>
                    <div className="flex flex-wrap gap-2">
                      {bundle.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 text-xs bg-gray-50 px-2 py-1 rounded"
                        >
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={20}
                              height={20}
                              className="rounded object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-gray-700 font-medium">
                            {item.product.name}
                            {item.quantity > 1 && ` (x${item.quantity})`}
                          </span>
                        </div>
                      ))}
                      {bundle.items.length > 3 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{bundle.items.length - 3} more
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
      </div>
    </section>
  )
}

