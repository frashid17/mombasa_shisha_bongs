'use client'

import { useState, useEffect } from 'react'
import { Search, X, Loader2, Percent, Calendar, FileText } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  images: Array<{ url: string }>
}

interface FlashSale {
  id: string
  title: string
  description?: string | null
  productIds: string[]
  discountPercent: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface FlashSaleFormProps {
  flashSale?: FlashSale
  onSuccess: () => void
  onCancel: () => void
}

export default function FlashSaleForm({ flashSale, onSuccess, onCancel }: FlashSaleFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [formData, setFormData] = useState({
    title: flashSale?.title || '',
    description: flashSale?.description || '',
    productIds: flashSale?.productIds || [] as string[],
    discountPercent: flashSale?.discountPercent || 10,
    startDate: flashSale?.startDate 
      ? new Date(flashSale.startDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    endDate: flashSale?.endDate
      ? new Date(flashSale.endDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: flashSale?.isActive ?? true,
  })

  useEffect(() => {
    if (showProductSelector && products.length === 0) {
      fetchProducts()
    }
  }, [showProductSelector])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return product.name.toLowerCase().includes(query) || product.id.toLowerCase().includes(query)
  })

  const selectedProducts = products.filter((p) => formData.productIds.includes(p.id))

  const handleAddProduct = (productId: string) => {
    if (!formData.productIds.includes(productId)) {
      setFormData({
        ...formData,
        productIds: [...formData.productIds, productId],
      })
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setFormData({
      ...formData,
      productIds: formData.productIds.filter((id) => id !== productId),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (formData.productIds.length === 0) {
        setError('Please select at least one product')
        setLoading(false)
        return
      }

      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        setError('End date must be after start date')
        setLoading(false)
        return
      }

      const url = flashSale
        ? `/api/admin/flash-sales/${flashSale.id}`
        : '/api/admin/flash-sales'
      const method = flashSale ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to save flash sale')
      }
    } catch (err) {
      console.error('Error saving flash sale:', err)
      setError('Failed to save flash sale. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900"
          required
          placeholder="e.g., Summer Sale - 50% Off"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description (Optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900"
          placeholder="Describe this flash sale..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Percent className="w-4 h-4" />
          Discount Percentage <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="100"
            value={formData.discountPercent}
            onChange={(e) =>
              setFormData({
                ...formData,
                discountPercent: Math.max(0, Math.min(100, Number(e.target.value))),
              })
            }
            className="w-32 border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900"
            required
          />
          <span className="text-gray-600">%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Start Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            End Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Products <span className="text-red-500">*</span>
        </label>
        
        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <div className="mb-3 space-y-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                {product.images?.[0] && (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    KES {product.price.toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Product Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProductSelector(!showProductSelector)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 text-left flex items-center justify-between"
          >
            <span className="text-gray-500">
              {formData.productIds.length === 0
                ? 'Select products...'
                : `${formData.productIds.length} product${formData.productIds.length !== 1 ? 's' : ''} selected`}
            </span>
            <Search className="w-5 h-5 text-gray-400" />
          </button>

          {showProductSelector && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No products found</div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map((product) => {
                      const isSelected = formData.productIds.includes(product.id)
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleAddProduct(product.id)}
                          disabled={isSelected}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 cursor-not-allowed'
                              : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          {product.images?.[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          )}
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              KES {product.price.toLocaleString()}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-900">
          Active (flash sale will be visible to customers)
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            flashSale ? 'Update Flash Sale' : 'Create Flash Sale'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

