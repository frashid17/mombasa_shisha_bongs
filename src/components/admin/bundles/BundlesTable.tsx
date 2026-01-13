'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Edit, Trash2, Package } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BundleItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    featuredImage: string | null
    images: Array<{ url: string }>
  }
}

interface Bundle {
  id: string
  name: string
  description: string | null
  price: number
  discount: number | null
  isActive: boolean
  items: BundleItem[]
  createdAt: Date
}

interface BundlesTableProps {
  bundles: Bundle[]
}

export default function BundlesTable({ bundles }: BundlesTableProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete bundle')
      }
    } catch (error) {
      console.error('Error deleting bundle:', error)
      alert('Failed to delete bundle')
    } finally {
      setDeleting(null)
    }
  }

  const calculateSavings = (bundle: Bundle) => {
    const totalIndividualPrice = bundle.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )
    const savings = totalIndividualPrice - Number(bundle.price)
    const savingsPercent = ((savings / totalIndividualPrice) * 100).toFixed(0)
    return { savings, savingsPercent }
  }

  // Mobile Card Component
  const BundleCard = ({ bundle }: { bundle: Bundle }) => {
    const { savings, savingsPercent } = calculateSavings(bundle)
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 mb-1">{bundle.name}</h3>
            {bundle.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>
            )}
          </div>
          <span
            className={`flex-shrink-0 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              bundle.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {bundle.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Products */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Products</p>
          <div className="space-y-2">
            {bundle.items.map((item) => {
              const imageUrl = item.product.featuredImage || item.product.images[0]?.url
              return (
                <div key={item.id} className="flex items-center gap-2">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.product.name}
                      width={40}
                      height={40}
                      className="rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 truncate">
                    {item.product.name} {item.quantity > 1 && `(x${item.quantity})`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Price & Savings */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-lg font-bold text-gray-900">
              KES {Number(bundle.price).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Savings</p>
            <p className="text-sm text-red-600 font-bold">
              {savingsPercent}%
            </p>
            <p className="text-xs text-red-600">
              KES {savings.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
          <Link
            href={`/admin/bundles/${bundle.id}/edit`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => handleDelete(bundle.id)}
            disabled={deleting === bundle.id}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-600 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting === bundle.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block space-y-4">
        {bundles.map((bundle) => {
          const { savings, savingsPercent } = calculateSavings(bundle)
          return (
            <div 
              key={bundle.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{bundle.name}</h3>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          bundle.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {bundle.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {bundle.description && (
                      <p className="text-sm text-gray-600 max-w-2xl">
                        {bundle.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/admin/bundles/${bundle.id}/edit`}
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(bundle.id)}
                      disabled={deleting === bundle.id}
                      className="inline-flex items-center gap-2 bg-white text-red-600 border-2 border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting === bundle.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Products Section */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Products in Bundle
                  </p>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                    {bundle.items.map((item) => {
                      const imageUrl = item.product.featuredImage || item.product.images[0]?.url
                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.product.name}
                              width={56}
                              height={56}
                              className="rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-7 h-7 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {item.quantity > 1 && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                                  Qty: {item.quantity}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                KES {Number(item.product.price).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Price & Savings Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Bundle Price
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        KES {Number(bundle.price).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Customer Savings
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-red-600">
                          {savingsPercent}%
                        </p>
                        <p className="text-sm font-medium text-red-600">
                          (KES {savings.toLocaleString()})
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bundle Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{bundle.items.length}</p>
                      <p className="text-xs text-gray-500 font-medium">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {bundle.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Total Items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

