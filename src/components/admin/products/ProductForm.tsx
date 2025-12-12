'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@prisma/client'

type ProductFormProps = {
  categories: Category[]
  product?: any
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      sku: formData.get('sku'),
      categoryId: formData.get('categoryId'),
      isActive: formData.get('isActive') === 'on',
    }

    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push('/admin/products')
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={product?.name}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">SKU *</label>
          <input
            type="text"
            name="sku"
            required
            defaultValue={product?.sku}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ color: '#111827' }}
          >
            <option value="" style={{ color: '#6b7280' }}>Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Price (KES) *</label>
          <input
            type="number"
            name="price"
            required
            step="0.01"
            defaultValue={product?.price}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Stock *</label>
          <input
            type="number"
            name="stock"
            required
            defaultValue={product?.stock}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="w-4 h-4"
          />
          <label className="text-sm font-semibold text-gray-900">Active</label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

