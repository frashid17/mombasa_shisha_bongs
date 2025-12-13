'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, X, Plus, Percent } from 'lucide-react'
import { ProductData } from '@/lib/email-templates'

interface Product {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  images: Array<{ url: string }>
  slug?: string
}

type SelectedProduct = ProductData & {
  images?: Array<{ url: string }>
}

interface ProductSelectorProps {
  selectedProducts: SelectedProduct[]
  onProductsChange: (products: SelectedProduct[]) => void
  showDiscount?: boolean
}

export default function ProductSelector({
  selectedProducts,
  onProductsChange,
  showDiscount = false,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetchProducts()
    }
  }, [isOpen])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query)
    )
  })

  const isProductSelected = (productId: string) => {
    return selectedProducts.some((p) => p.id === productId)
  }

  const handleAddProduct = (product: Product) => {
    if (!isProductSelected(product.id)) {
      onProductsChange([...selectedProducts, { ...product, discountPercent: 0 }])
    }
  }

  const handleRemoveProduct = (productId: string) => {
    onProductsChange(selectedProducts.filter((p) => p.id !== productId))
  }

  const handleDiscountChange = (productId: string, discount: number) => {
    onProductsChange(
      selectedProducts.map((p) =>
        p.id === productId ? { ...p, discountPercent: Math.max(0, Math.min(100, discount)) } : p
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">
            Selected Products ({selectedProducts.length})
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                {product.images && product.images[0] && (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    KES {product.price.toLocaleString()}
                  </p>
                </div>
                {showDiscount && (
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={product.discountPercent || 0}
                      onChange={(e) =>
                        handleDiscountChange(product.id, parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="%"
                    />
                  </div>
                )}
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  aria-label="Remove product"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Selector */}
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            {isOpen ? 'Close Product Selector' : 'Add Products'}
          </span>
          <Plus className="w-5 h-5 text-gray-400" />
        </button>

        {isOpen && (
          <div className="mt-3 border border-gray-200 rounded-lg bg-white shadow-lg max-h-96 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No products found' : 'No products available'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const isSelected = isProductSelected(product.id)
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        disabled={isSelected}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                            : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        {product.images && product.images[0] && (
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
                          <span className="text-xs text-green-600 font-semibold">Added</span>
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
  )
}

