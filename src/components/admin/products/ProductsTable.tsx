'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

type Product = {
  id: string
  name: string
  sku: string | null
  price: number | string
  stock: number
  isActive: boolean
  isSoldOut?: boolean
}

type ProductWithRelations = Product & {
  category: { name: string }
  images: Array<{ url: string }>
  _count: { orderItems: number }
}

export default function ProductsTable({ products }: { products: ProductWithRelations[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [availabilityUpdatingId, setAvailabilityUpdatingId] = useState<string | null>(null)

  const handleAvailabilityChange = async (productId: string, available: boolean) => {
    setAvailabilityUpdatingId(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSoldOut: !available }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update availability')
      }
      toast.success(available ? 'Marked as available' : 'Marked as sold out')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'Failed to update availability')
    } finally {
      setAvailabilityUpdatingId(null)
    }
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(productId)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete product')
      }

      toast.success('Product deleted successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product')
      console.error('Delete error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  // Mobile Card Component
  const ProductCard = ({ product }: { product: ProductWithRelations }) => {
    const isSoldOut = product.isSoldOut ?? false
    const available = !isSoldOut
    const busy = availabilityUpdatingId === product.id

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {/* Header with Image and Title */}
        <div className="flex items-start gap-3">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={60}
              height={60}
              className="rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-[60px] h-[60px] bg-gray-200 rounded flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">{product.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{product.sku}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  product.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
              {isSoldOut && (
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-900 text-white">
                  Sold out
                </span>
              )}
              <span className="text-xs text-gray-600">{product.category?.name || 'Uncategorized'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={available}
              disabled={busy}
              onChange={(e) =>
                handleAvailabilityChange(product.id, e.target.checked)
              }
              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
            />
            <span>{available ? 'Available' : 'Sold out'}</span>
          </label>
          {busy && <span className="text-xs text-gray-500">Saving…</span>}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-sm font-bold text-gray-900">KES {product.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Stock</p>
            <p className="text-sm font-semibold text-gray-900">{product.stock}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Sales</p>
            <p className="text-sm font-semibold text-gray-900">{product._count.orderItems}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
          <Link
            href={`/admin/products/${product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-600 text-white px-3 py-2.5 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button 
            onClick={() => handleDelete(product.id, product.name)}
            disabled={deletingId === product.id}
            className="px-3 py-2.5 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Trash2 className={`w-4 h-4 ${deletingId === product.id ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const isSoldOut = product.isSoldOut ?? false
                  const available = !isSoldOut
                  const busy = availabilityUpdatingId === product.id

                  return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-gray-600 truncate">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">KES {product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product._count.orderItems}</td>
                    <td className="px-6 py-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={available}
                          disabled={busy}
                          onChange={(e) =>
                            handleAvailabilityChange(product.id, e.target.checked)
                          }
                          title={available ? 'Uncheck to mark sold out' : 'Check to mark available'}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-900 whitespace-nowrap">
                          {busy ? 'Saving…' : available ? 'Available' : 'Sold out'}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {isSoldOut && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-900 text-white">
                            Sold out
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          aria-label="View product"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                          aria-label="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Delete product"
                        >
                          <Trash2 className={`w-4 h-4 ${deletingId === product.id ? 'animate-pulse' : ''}`} />
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
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">No products found</div>
        )}
      </div>
    </>
  )
}

