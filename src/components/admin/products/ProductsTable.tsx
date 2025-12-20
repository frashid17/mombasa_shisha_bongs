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
}

type ProductWithRelations = Product & {
  category: { name: string }
  images: Array<{ url: string }>
  _count: { orderItems: number }
}

export default function ProductsTable({ products }: { products: ProductWithRelations[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Product</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden sm:table-cell">Category</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Price</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden md:table-cell">Stock</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden lg:table-cell">Sales</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden sm:table-cell">Status</th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
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
                        <div className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{product.name}</div>
                        <div className="text-xs text-gray-600 truncate">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{product.category?.name || 'Uncategorized'}</td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">KES {product.price.toLocaleString()}</td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden md:table-cell">{product.stock}</td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{product._count.orderItems}</td>
                  <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded"
                        aria-label="View product"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-50 rounded"
                        aria-label="Edit product"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete product"
                      >
                        <Trash2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${deletingId === product.id ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">No products found</div>
      )}
    </div>
  )
}

