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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
  )
}

