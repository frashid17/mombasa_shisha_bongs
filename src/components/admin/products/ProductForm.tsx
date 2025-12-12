'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react'

type Category = {
  id: string
  name: string
  slug: string
}

type ProductFormProps = {
  categories: Category[]
  product?: any
}

type ImageInput = {
  url: string
  altText: string
  isPrimary: boolean
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})
  const [images, setImages] = useState<ImageInput[]>(
    product?.images?.map((img: any) => ({
      url: img.url,
      altText: img.altText || '',
      isPrimary: img.isPrimary || false,
    })) || [{ url: '', altText: '', isPrimary: true }]
  )

  const handleFileUpload = async (index: number, file: File) => {
    setUploading(index)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        updateImage(index, 'url', data.url)
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(null)
    }
  }

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(index, file)
    }
  }

  const addImage = () => {
    setImages([...images, { url: '', altText: '', isPrimary: false }])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // Ensure at least one image remains, and mark first as primary if needed
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true
    }
    setImages(newImages)
  }

  const updateImage = (index: number, field: keyof ImageInput, value: string | boolean) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    
    // If setting as primary, unset others
    if (field === 'isPrimary' && value === true) {
      newImages.forEach((img, i) => {
        if (i !== index) img.isPrimary = false
      })
    }
    
    setImages(newImages)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const imageUrls = images
      .map(img => img.url.trim())
      .filter(url => url.length > 0)

    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      sku: formData.get('sku'),
      categoryId: formData.get('categoryId'),
      isActive: formData.get('isActive') === 'on',
      images: imageUrls.map((url, index) => ({
        url,
        altText: images[index].altText || '',
        position: index,
        isPrimary: images[index].isPrimary || (index === 0 && !images.some(img => img.isPrimary)),
      })),
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
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save product')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while saving the product')
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
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">SKU *</label>
          <input
            type="text"
            name="sku"
            required
            defaultValue={product?.sku}
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
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
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Stock *</label>
          <input
            type="number"
            name="stock"
            required
            defaultValue={product?.stock}
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
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
          className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
          style={{ color: '#111827' }}
        />
      </div>

      {/* Product Images */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">Product Images</label>
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        </div>
        <div className="space-y-4">
          {images.map((image, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Image *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => {
                          fileInputRefs.current[index] = el
                        }}
                        onChange={(e) => handleFileSelect(index, e)}
                        className="hidden"
                        id={`file-${index}`}
                      />
                      <label
                        htmlFor={`file-${index}`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-50 transition"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading === index ? 'Uploading...' : 'Upload File'}
                      </label>
                      <div className="flex-1 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          value={image.url}
                          onChange={(e) => updateImage(index, 'url', e.target.value)}
                          placeholder="Or enter image URL (e.g., https://example.com/image.jpg)"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Alt Text (for accessibility)
                    </label>
                    <input
                      type="text"
                      value={image.altText}
                      onChange={(e) => updateImage(index, 'altText', e.target.value)}
                      placeholder="Describe the image for accessibility (e.g., Red shisha hookah on wooden table)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={image.isPrimary}
                      onChange={(e) => updateImage(index, 'isPrimary', e.target.checked)}
                      className="w-4 h-4"
                      id={`primary-${index}`}
                    />
                    <label htmlFor={`primary-${index}`} className="text-xs text-gray-700">
                      Set as primary image
                    </label>
                  </div>
                </div>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {image.url && (
                <div className="mt-3">
                  <img
                    src={image.url}
                    alt={image.altText || 'Preview'}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EInvalid URL%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <ImageIcon className="w-3 h-3 inline mr-1" />
          Upload images from your computer or enter image URLs. The first image or the one marked as primary will be used as the main product image.
        </p>
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

