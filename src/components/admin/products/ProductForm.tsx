'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Image as ImageIcon, Upload, Link as LinkIcon, Crop } from 'lucide-react'
import ImageEditor from '../ImageEditor'
import ProductColorsManager from './ProductColorsManager'
import ProductSpecsManager from './ProductSpecsManager'

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

type DraftColor = {
  name: string
  value: string
}

type DraftSpec = {
  type: string
  name: string
  value: string | null
  position: number
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editorImageSrc, setEditorImageSrc] = useState('')
  const [editorImageIndex, setEditorImageIndex] = useState<number | null>(null)
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})
  const [images, setImages] = useState<ImageInput[]>(
    product?.images?.map((img: any) => ({
      url: img.url,
      altText: img.altText || '',
      isPrimary: img.isPrimary || false,
    })) || [{ url: '', altText: '', isPrimary: true }]
  )
  // Draft state for colors and specs when creating new product
  const [draftColors, setDraftColors] = useState<DraftColor[]>([])
  const [draftSpecs, setDraftSpecs] = useState<DraftSpec[]>([])

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
        setEditorImageIndex(index)
        setShowEditor(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditorSave = async (croppedBlob: Blob) => {
    if (editorImageIndex === null) return
    
    setShowEditor(false)
    setUploading(editorImageIndex)
    try {
      // Convert blob to file
      const file = new File([croppedBlob], `product-image-${editorImageIndex}.jpg`, { type: 'image/jpeg' })
      await handleFileUpload(editorImageIndex, file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image')
    } finally {
      setUploading(null)
      setEditorImageSrc('')
      setEditorImageIndex(null)
    }
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
    setEditorImageSrc('')
    setEditorImageIndex(null)
    if (editorImageIndex !== null && fileInputRefs.current[editorImageIndex]) {
      fileInputRefs.current[editorImageIndex]!.value = ''
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
      .filter(url => {
        // Accept full URLs, relative paths, and data URLs (Base64)
        return url.length > 0 && (
          url.startsWith('http://') || 
          url.startsWith('https://') || 
          url.startsWith('/') ||
          url.startsWith('data:image/') // Base64 data URLs
        )
      })

    if (imageUrls.length === 0) {
      alert('Please add at least one image (upload a file or enter a URL)')
      setLoading(false)
      return
    }

    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      sku: formData.get('sku'),
      categoryId: formData.get('categoryId'),
      brand: formData.get('brand') || null,
      isActive: formData.get('isActive') === 'on',
      images: imageUrls.map((url, index) => {
        // Find the original image index to get altText and isPrimary
        const originalIndex = images.findIndex(img => img.url.trim() === url)
        return {
          url,
          altText: originalIndex >= 0 ? images[originalIndex].altText || '' : '',
          position: index,
          isPrimary: originalIndex >= 0 ? images[originalIndex].isPrimary : (index === 0),
        }
      }),
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
        const savedProduct = await res.json()
        
        // If creating a new product, save draft colors and specs
        if (!product && savedProduct.id) {
          // Save draft colors
          if (draftColors.length > 0) {
            try {
              await Promise.all(
                draftColors.map(color =>
                  fetch(`/api/admin/products/${savedProduct.id}/colors`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(color),
                  })
                )
              )
            } catch (error) {
              console.error('Failed to save colors:', error)
            }
          }
          
          // Save draft specs
          if (draftSpecs.length > 0) {
            try {
              await Promise.all(
                draftSpecs.map((spec, index) =>
                  fetch(`/api/admin/products/${savedProduct.id}/specs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: spec.type,
                      name: spec.name,
                      value: spec.value,
                      position: spec.position + index,
                    }),
                  })
                )
              )
            } catch (error) {
              console.error('Failed to save specs:', error)
            }
          }
          
          router.push(`/admin/products/${savedProduct.id}/edit`)
        } else {
          router.push('/admin/products')
          router.refresh()
        }
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
          <label className="block text-sm font-semibold text-gray-900 mb-2">Brand</label>
          <input
            type="text"
            name="brand"
            defaultValue={product?.brand || ''}
            placeholder="e.g., Al Fakher, Starbuzz, Fumari"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ color: '#111827' }}
          />
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
                        {uploading === index ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Crop className="w-4 h-4" />
                            Upload & Edit
                          </>
                        )}
                      </label>
                      <div className="flex-1 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={image.url}
                          onChange={(e) => updateImage(index, 'url', e.target.value)}
                          placeholder="Or enter image URL (e.g., https://example.com/image.jpg or /uploads/products/image.jpg)"
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

      {/* Product Colors */}
      {product?.id ? (
        <ProductColorsManager productId={product.id} />
      ) : (
        <DraftColorsManager 
          colors={draftColors} 
          onColorsChange={setDraftColors} 
        />
      )}

      {/* Product Specifications */}
      {product?.id ? (
        <ProductSpecsManager productId={product.id} />
      ) : (
        <DraftSpecsManager 
          specs={draftSpecs} 
          onSpecsChange={setDraftSpecs} 
        />
      )}

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

      {/* Image Editor Modal */}
      {showEditor && editorImageSrc && (
        <ImageEditor
          imageSrc={editorImageSrc}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
          aspectRatio={1}
        />
      )}
    </form>
  )
}

// Draft Colors Manager - for use when creating new products
function DraftColorsManager({ 
  colors, 
  onColorsChange 
}: { 
  colors: DraftColor[]
  onColorsChange: (colors: DraftColor[]) => void 
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', value: '#000000' })

  const getHexFromColorName = (name: string): string | null => {
    const colorMap: { [key: string]: string } = {
      'red': '#FF0000', 'green': '#00FF00', 'blue': '#0000FF', 'yellow': '#FFFF00',
      'orange': '#FFA500', 'purple': '#800080', 'pink': '#FFC0CB', 'brown': '#A52A2A',
      'black': '#000000', 'white': '#FFFFFF', 'gray': '#808080', 'grey': '#808080',
    }
    return colorMap[name.trim().toLowerCase()] || null
  }

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      alert('Please enter color name and value')
      return
    }

    let colorValue = formData.value.trim()
    if (!colorValue.startsWith('#')) {
      colorValue = '#' + colorValue
    }
    if (!/^#[0-9A-Fa-f]{6}$/i.test(colorValue)) {
      alert('Please enter a valid hex color code (e.g., #FF0000)')
      return
    }

    onColorsChange([...colors, { name: formData.name.trim(), value: colorValue.toUpperCase() }])
    setFormData({ name: '', value: '#000000' })
    setShowAddForm(false)
  }

  const handleDelete = (index: number) => {
    onColorsChange(colors.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">Product Colors (Optional)</label>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Color
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value
                  const autoHex = getHexFromColorName(newName)
                  setFormData({ 
                    name: newName, 
                    value: autoHex || formData.value 
                  })
                }}
                placeholder="e.g., Red, Blue, Green"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color Value (Hex)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.value.startsWith('#') ? formData.value : `#${formData.value}`}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value.toUpperCase() })}
                  className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => {
                    let value = e.target.value.trim()
                    if (value && !value.startsWith('#')) value = '#' + value
                    value = value.toUpperCase().replace(/[^#0-9A-F]/g, '')
                    setFormData({ ...formData, value })
                  }}
                  placeholder="#FF0000"
                  maxLength={7}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setFormData({ name: '', value: '#000000' })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="space-y-2">
          {colors.map((color, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div
                className="w-10 h-10 rounded border-2 border-gray-300"
                style={{ backgroundColor: color.value }}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{color.name}</p>
                <p className="text-xs text-gray-500">{color.value}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {colors.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-500 italic">No colors added. Colors are optional.</p>
      )}
    </div>
  )
}

// Draft Specs Manager - for use when creating new products
function DraftSpecsManager({ 
  specs, 
  onSpecsChange 
}: { 
  specs: DraftSpec[]
  onSpecsChange: (specs: DraftSpec[]) => void 
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ 
    type: 'Size', 
    name: '', 
    value: '',
    position: 0 
  })

  const specTypes = [
    { value: 'Size', label: 'Size', commonValues: ['250g', '500g', '1kg', '50g', '100g'] },
    { value: 'Flavor', label: 'Flavor', commonValues: ['Mint', 'Gum with Mint', 'Apple', 'Grape', 'Watermelon', 'Strawberry', 'Blueberry', 'Cherry', 'Vanilla', 'Chocolate'] },
    { value: 'Weight', label: 'Weight', commonValues: ['250g', '500g', '1kg'] },
    { value: 'Volume', label: 'Volume', commonValues: ['250ml', '500ml', '1L'] },
    { value: 'Other', label: 'Other', commonValues: [] },
  ]

  const handleAdd = () => {
    if (!formData.type || !formData.name.trim()) {
      alert('Please enter specification type and name')
      return
    }

    // Parse comma-separated values
    const names = formData.name
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0)

    if (names.length === 0) {
      alert('Please enter at least one specification name')
      return
    }

    // Add all specifications
    const newSpecs = names.map((name, index) => ({
      type: formData.type,
      name: name,
      value: formData.value.trim() || null,
      position: formData.position + index,
    }))

    onSpecsChange([...specs, ...newSpecs])
    setFormData({ type: 'Size', name: '', value: '', position: 0 })
    setShowAddForm(false)
  }

  const handleDelete = (index: number) => {
    onSpecsChange(specs.filter((_, i) => i !== index))
  }

  const selectedType = specTypes.find(t => t.value === formData.type)
  const commonValues = selectedType?.commonValues || []

  // Group specs by type
  const specsByType = specs.reduce((acc, spec) => {
    if (!acc[spec.type]) acc[spec.type] = []
    acc[spec.type].push(spec)
    return acc
  }, {} as Record<string, DraftSpec[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">
          Product Specifications (Optional)
          <span className="text-xs font-normal text-gray-500 ml-2">
            e.g., Size (250g), Flavor (Mint)
          </span>
        </label>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Specification
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, name: '' })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
              >
                {specTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-gray-500 font-normal">(comma-separated for multiple)</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`e.g., ${commonValues.slice(0, 3).join(', ') || 'Mint, Apple, Grape'}`}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
                />
                <p className="text-xs text-gray-500">
                  💡 Tip: Separate multiple values with commas (e.g., "Mint, Gum with Mint, Apple")
                </p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Value (Optional)
              <span className="text-gray-500 font-normal ml-1">- Additional info</span>
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Optional value"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setFormData({ type: 'Size', name: '', value: '', position: 0 })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {specs.length > 0 && (
        <div className="space-y-3">
          {Object.entries(specsByType).map(([type, typeSpecs]) => (
            <div key={type} className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{type}</h4>
              {typeSpecs.map((spec, index) => {
                const specIndex = specs.findIndex(s => s === spec)
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{spec.name}</p>
                      {spec.value && (
                        <p className="text-xs text-gray-500">{spec.value}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(specIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {specs.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-500 italic">No specifications added. Specifications are optional.</p>
      )}
    </div>
  )
}

