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
            {bundle.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.product.featuredImage ? (
                  <Image
                    src={item.product.featuredImage}
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
            ))}
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
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bundle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bundles.map((bundle) => {
                const { savings, savingsPercent } = calculateSavings(bundle)
                return (
                  <tr key={bundle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{bundle.name}</div>
                        {bundle.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {bundle.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {bundle.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            {item.product.featuredImage ? (
                              <Image
                                src={item.product.featuredImage}
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
                            <span className="text-sm text-gray-700">
                              {item.product.name} {item.quantity > 1 && `(x${item.quantity})`}
                            </span>
                          </div>
                        ))}
                        {bundle.items.length > 3 && (
                          <span className="text-sm text-gray-500">
                            +{bundle.items.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        KES {Number(bundle.price).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-semibold">
                        Save {savingsPercent}% (KES {savings.toLocaleString()})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bundle.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {bundle.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/bundles/${bundle.id}/edit`}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(bundle.id)}
                          disabled={deleting === bundle.id}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

