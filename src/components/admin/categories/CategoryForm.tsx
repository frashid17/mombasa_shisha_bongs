'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CategoryFormProps = {
  category?: any
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const data = {
      name,
      slug,
      description: formData.get('description') || null,
      image: formData.get('image') || null,
      isActive: formData.get('isActive') === 'on',
    }

    try {
      const url = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories'
      const method = category ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push('/admin/categories')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save category')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while saving the category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Category Name *</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={category?.name}
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Image URL</label>
          <input
            type="url"
            name="image"
            defaultValue={category?.image || ''}
            placeholder="https://example.com/image.jpg"
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400"
            style={{ color: '#111827' }}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={category?.description || ''}
          placeholder="Category description..."
          className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400"
          style={{ color: '#111827' }}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.isActive ?? true}
          className="w-4 h-4"
        />
        <label className="text-sm font-semibold text-gray-900">Active</label>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
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

