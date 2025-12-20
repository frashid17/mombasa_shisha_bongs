'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CategoriesTable({ categories }: { categories: any[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (categoryId: string, categoryName: string, productCount: number) => {
    if (productCount > 0) {
      toast.error(`Cannot delete "${categoryName}". It has ${productCount} product(s). Please reassign or delete products first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(categoryId)
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }

      toast.success('Category deleted successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category')
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
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Image</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden md:table-cell">Description</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Products</th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    {category.image ? (
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover"
                          unoptimized={category.image.startsWith('http') && !category.image.includes('localhost')}
                          onError={(e) => {
                            // Prevent infinite loop by checking if already set to fallback
                            if (e.currentTarget.src.includes('data:image/svg')) return
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-900">{category.name}</td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 hidden md:table-cell">{category.description || '-'}</td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">{category._count.products}</td>
                  <td className="px-3 sm:px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-50 rounded"
                        aria-label="Edit category"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(category.id, category.name, category._count?.products || 0)}
                        disabled={deletingId === category.id}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete category"
                      >
                        <Trash2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${deletingId === category.id ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">No categories found</div>
      )}
    </div>
  )
}

