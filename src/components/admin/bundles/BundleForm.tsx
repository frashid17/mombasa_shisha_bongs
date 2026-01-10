'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Plus, X, Package, Upload } from 'lucide-react'

interface BundleItem {
  id?: string
  productId: string
  quantity: number
  colorId?: string | null
  specId?: string | null
  allowColorSelection?: boolean
  allowSpecSelection?: boolean
  product?: {
    id: string
    name: string
    price: number
    featuredImage: string | null
    colors?: Array<{ id: string; name: string; value: string }>
    specifications?: Array<{ id: string; type: string; name: string; value: string | null }>
  }
}

interface Bundle {
  id: string
  name: string
  description: string | null
  image: string | null
  price: number
  discount: number | null
  isActive: boolean
  items: BundleItem[]
}

interface BundleFormProps {
  bundle?: Bundle
}

export default function BundleForm({ bundle }: BundleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editorImageSrc, setEditorImageSrc] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: bundle?.name || '',
    description: bundle?.description || '',
    image: bundle?.image || '',
    price: bundle?.price ? Number(bundle.price) : 0,
    discount: bundle?.discount ? Number(bundle.discount) : 0,
    isActive: bundle?.isActive ?? true,
    items: (bundle?.items || []) as BundleItem[],
  })

  // Fetch all products on mount
  useEffect(() => {
    async function fetchAllProducts() {
      setLoadingProducts(true)
      try {
        const res = await fetch('/api/products?limit=1000')
        if (!res.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await res.json()
        setAllProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchAllProducts()
  }, [])

  // Filter products based on search query
  const filteredProducts = allProducts.filter((product) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.category?.name.toLowerCase().includes(query)
    )
  })

  // Image upload handlers
  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'bundles')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }))
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
      // Upload directly (no editor for bundle images)
      handleFileUpload(file)
    }
  }

  const addProduct = async (product: any) => {
    const exists = formData.items.some((item) => item.productId === product.id)
    if (exists) return

    // Fetch full product details including colors and specs
    try {
      const res = await fetch(`/api/products/${product.id}`)
      const fullProduct = res.ok ? await res.json() : product

      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            productId: product.id,
            quantity: 1,
            colorId: null,
            specId: null,
            allowColorSelection: true,
            allowSpecSelection: true,
            product: {
              id: product.id,
              name: product.name,
              price: Number(product.price),
              featuredImage: product.featuredImage || product.image,
              colors: fullProduct.colors || product.colors || [],
              specifications: fullProduct.specifications || product.specifications || [],
            },
          },
        ],
      })
      setSearchQuery('')
    } catch (error) {
      console.error('Error fetching product details:', error)
      // Add without full details
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            productId: product.id,
            quantity: 1,
            colorId: null,
            specId: null,
            allowColorSelection: true,
            allowSpecSelection: true,
            product: {
              id: product.id,
              name: product.name,
              price: Number(product.price),
              featuredImage: product.featuredImage || product.image,
              colors: product.colors || [],
              specifications: product.specifications || [],
            },
          },
        ],
      })
      setSearchQuery('')
    }
  }

  const removeProduct = (productId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.productId !== productId),
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    })
  }

  const updateItemColor = (productId: string, colorId: string | null) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.productId === productId ? { ...item, colorId } : item
      ),
    })
  }

  const updateItemSpec = (productId: string, specId: string | null) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.productId === productId ? { ...item, specId } : item
      ),
    })
  }

  const toggleColorSelection = (productId: string) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.productId === productId
          ? { ...item, allowColorSelection: !item.allowColorSelection, colorId: item.allowColorSelection ? null : item.colorId }
          : item
      ),
    })
  }

  const toggleSpecSelection = (productId: string) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.productId === productId
          ? { ...item, allowSpecSelection: !item.allowSpecSelection, specId: item.allowSpecSelection ? null : item.specId }
          : item
      ),
    })
  }

  const calculateTotalPrice = () => {
    return formData.items.reduce((sum, item) => {
      const productPrice = item.product?.price || 0
      return sum + productPrice * item.quantity
    }, 0)
  }

  const calculateDiscount = () => {
    const total = calculateTotalPrice()
    const bundlePrice = formData.price || 0
    return total - bundlePrice
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.items.length === 0) {
      alert('Please fill in all required fields and add at least one product')
      return
    }

    setLoading(true)
    try {
      const url = bundle ? `/api/admin/bundles/${bundle.id}` : '/api/admin/bundles'
      const method = bundle ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          image: formData.image || null,
          price: formData.price,
          discount: calculateDiscount(),
          isActive: formData.isActive,
          items: formData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            colorId: item.allowColorSelection ? null : item.colorId || null,
            specId: item.allowSpecSelection ? null : item.specId || null,
            allowColorSelection: item.allowColorSelection ?? true,
            allowSpecSelection: item.allowSpecSelection ?? true,
          })),
        }),
      })

      if (res.ok) {
        router.push('/admin/bundles')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save bundle')
      }
    } catch (error) {
      console.error('Error saving bundle:', error)
      alert('Failed to save bundle')
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = calculateTotalPrice()
  const discount = calculateDiscount()
  const discountPercent = totalPrice > 0 ? ((discount / totalPrice) * 100).toFixed(0) : 0

  useEffect(() => {
    if (formData.items.length > 0 && formData.price === 0) {
      setFormData({ ...formData, price: totalPrice })
    }
  }, [formData.items])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <label htmlFor="bundle-name" className="block text-sm font-semibold text-gray-900 mb-2">
            Bundle Name *
          </label>
          <input
            type="text"
            id="bundle-name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoComplete="off"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>

        <div>
          <label htmlFor="bundle-description" className="block text-sm font-semibold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="bundle-description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            autoComplete="off"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Bundle Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Bundle Image
          </label>
          <div className="space-y-3">
            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              <span className="text-sm text-gray-500">or</span>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            {/* Image Preview */}
            {formData.image && (
              <div className="w-full max-w-md">
                <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={formData.image}
                    alt="Bundle preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload an image or enter a URL for the bundle featured image
          </p>
        </div>

        {/* Add Products */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Add Products *
          </label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products to filter..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {loadingProducts ? (
            <div className="border border-gray-200 rounded-lg bg-white p-8 text-center">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg bg-white shadow-lg max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No products found</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isAlreadyAdded = formData.items.some((item) => item.productId === product.id)
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => !isAlreadyAdded && addProduct(product)}
                      disabled={isAlreadyAdded}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors ${
                        isAlreadyAdded ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                      }`}
                    >
                      {product.featuredImage || product.image ? (
                        <Image
                          src={product.featuredImage || product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          KES {Number(product.price).toLocaleString()}
                          {product.category && (
                            <span className="ml-2 text-xs text-gray-400">
                              • {product.category.name}
                            </span>
                          )}
                        </p>
                      </div>
                      {isAlreadyAdded ? (
                        <span className="text-xs text-red-600 font-semibold">Added</span>
                      ) : (
                        <Plus className="w-5 h-5 text-red-600" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
          {filteredProducts.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Showing {filteredProducts.length} of {allProducts.length} products
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* Selected Products with Specs */}
        {formData.items.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Bundle Products ({formData.items.length})
            </label>
            <div className="space-y-4">
              {formData.items.map((item) => (
                <div
                  key={item.productId}
                  className="border-2 border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-4">
                    {item.product?.featuredImage ? (
                      <Image
                        src={item.product.featuredImage}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product?.name}</p>
                      <p className="text-sm text-gray-600">
                        KES {item.product?.price.toLocaleString()} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(item.productId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Color Selection */}
                  {item.product?.colors && item.product.colors.length > 0 && (
                    <div className="pl-20 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`allow-color-${item.productId}`}
                          checked={item.allowColorSelection ?? true}
                          onChange={() => toggleColorSelection(item.productId)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor={`allow-color-${item.productId}`} className="text-sm font-medium text-gray-700">
                          Allow customer to choose color
                        </label>
                      </div>
                      {!item.allowColorSelection && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pre-select Color:
                          </label>
                          <select
                            value={item.colorId || ''}
                            onChange={(e) => updateItemColor(item.productId, e.target.value || null)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">Select a color</option>
                            {item.product.colors.map((color) => (
                              <option key={color.id} value={color.id}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Spec Selection */}
                  {item.product?.specifications && item.product.specifications.length > 0 && (
                    <div className="pl-20 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`allow-spec-${item.productId}`}
                          checked={item.allowSpecSelection ?? true}
                          onChange={() => toggleSpecSelection(item.productId)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor={`allow-spec-${item.productId}`} className="text-sm font-medium text-gray-700">
                          Allow customer to choose {item.product.specifications[0]?.type || 'specification'}
                        </label>
                      </div>
                      {!item.allowSpecSelection && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pre-select {item.product.specifications[0]?.type || 'Specification'}:
                          </label>
                          <select
                            value={item.specId || ''}
                            onChange={(e) => updateItemSpec(item.productId, e.target.value || null)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">Select a {item.product.specifications[0]?.type || 'option'}</option>
                            {item.product.specifications.map((spec) => (
                              <option key={spec.id} value={spec.id}>
                                {spec.name} {spec.value ? `(${spec.value})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Total Individual Price
            </label>
            <p className="text-2xl font-bold text-gray-900">
              KES {totalPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Bundle Price *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              min={0}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
            {discount > 0 && (
              <p className="text-sm text-red-600 font-semibold mt-2">
                Save {discountPercent}% (KES {discount.toLocaleString()})
              </p>
            )}
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
            Active (visible to customers)
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || formData.items.length === 0}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : bundle ? 'Update Bundle' : 'Create Bundle'}
        </button>
      </div>
    </form>
  )
}
