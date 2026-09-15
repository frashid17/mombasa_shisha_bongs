'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  const [localProducts, setLocalProducts] = useState(products)

  useEffect(() => {
    setLocalProducts(products)
  }, [products])

  const handleAvailabilityChange = async (productId: string, available: boolean) => {
    setAvailabilityUpdatingId(productId)
    const nextStock = available ? 100 : 0
    const nextSoldOut = !available

    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isSoldOut: nextSoldOut, stock: nextStock } : p
      )
    )

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSoldOut: nextSoldOut,
          stock: nextStock,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update availability')
      }
      toast.success(
        available
          ? 'Marked available — stock set to 100'
          : 'Marked sold out — stock set to 0'
      )
      router.refresh()
    } catch (e: any) {
      setLocalProducts(products)
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
      setLocalProducts((prev) => prev.filter((p) => p.id !== productId))
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product')
      console.error('Delete error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (localProducts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-500">No products found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {localProducts.map((product) => {
        const isSoldOut = product.isSoldOut ?? false
        const available = !isSoldOut
        const busy = availabilityUpdatingId === product.id
        const price =
          typeof product.price === 'number'
            ? product.price
            : Number(product.price)

        return (
          <article
            key={product.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    width={56}
                    height={56}
                    className="rounded-lg object-cover flex-shrink-0 w-14 h-14"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {product.sku || 'No SKU'} · {product.category?.name || 'Uncategorized'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {!available && (
                      <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-gray-900 text-white">
                        Sold out
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6 sm:flex-shrink-0">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Price</p>
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    KES {price.toLocaleString()}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Stock</p>
                  <p className="text-sm font-semibold text-gray-900">{product.stock}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Sales</p>
                  <p className="text-sm font-semibold text-gray-900">{product._count.orderItems}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:flex-shrink-0 sm:gap-4 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={available}
                    disabled={busy}
                    onChange={(e) => handleAvailabilityChange(product.id, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
                  />
                  <span className="whitespace-nowrap">
                    {busy ? 'Saving…' : available ? 'Available' : 'Sold out'}
                  </span>
                </label>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex items-center justify-center p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="View product"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="inline-flex items-center justify-center p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Edit product"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                    className="inline-flex items-center justify-center p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Delete product"
                    title="Delete"
                  >
                    <Trash2
                      className={`w-4 h-4 ${deletingId === product.id ? 'animate-pulse' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
