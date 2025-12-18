'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, Link as LinkIcon, Crop } from 'lucide-react'
import ImageEditor from '../ImageEditor'

type CategoryFormProps = {
  category?: any
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(category?.image || '')
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('url')
  const [showEditor, setShowEditor] = useState(false)
  const [editorImageSrc, setEditorImageSrc] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'categories')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        setImageUrl(data.url)
        setImageSource('upload')
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only images are allowed (JPEG, PNG, WebP, GIF).')
        return
      }
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        alert('File size exceeds 5MB limit')
        return
      }
      // Show image editor
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditorImageSrc(e.target?.result as string)
        setShowEditor(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditorSave = async (croppedBlob: Blob) => {
    setShowEditor(false)
    setUploading(true)
    try {
      // Convert blob to file
      const file = new File([croppedBlob], 'category-image.jpg', { type: 'image/jpeg' })
      await handleFileUpload(file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image')
    } finally {
      setUploading(false)
      setEditorImageSrc('')
    }
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
    setEditorImageSrc('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    setImageSource('url')
  }

  const clearImage = () => {
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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

    const description = formData.get('description') as string

    const data = {
      name,
      slug,
      ...(description && { description }),
      ...(imageUrl && { image: imageUrl }),
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
          <label className="block text-sm font-semibold text-gray-900 mb-2">Category Image</label>
          
          {/* Image Preview */}
          {imageUrl && (
            <div className="mb-4 relative">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                <Image
                  src={imageUrl}
                  alt="Category preview"
                  fill
                  className="object-cover"
                  onError={() => {
                    alert('Failed to load image. Please check the URL or upload a new image.')
                    setImageUrl('')
                  }}
                />
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload/URL Tabs */}
          <div className="flex gap-2 mb-3 border-b border-gray-300">
            <button
              type="button"
              onClick={() => setImageSource('upload')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                imageSource === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setImageSource('url')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                imageSource === 'url'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              URL
            </button>
          </div>

          {/* Upload Option */}
          {imageSource === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-colors ${
                  uploading
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-gray-700">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Crop className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      {imageUrl ? 'Change Image (Crop/Resize)' : 'Click to upload & edit image'}
                    </span>
                  </>
                )}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPEG, PNG, WebP, GIF (Max 5MB) - You can crop and resize after selecting
              </p>
            </div>
          )}

          {/* URL Option */}
          {imageSource === 'url' && (
            <div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg or /uploads/categories/image.jpg"
                className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400"
                style={{ color: '#111827' }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter a full URL (https://...) or a relative path (/uploads/...)
              </p>
            </div>
          )}
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

      {/* Image Editor Modal */}
      {showEditor && editorImageSrc && (
        <ImageEditor
          imageSrc={editorImageSrc}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
          aspectRatio={16 / 9}
        />
      )}
    </form>
  )
}

