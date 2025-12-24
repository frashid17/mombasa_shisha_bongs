'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpDown, X } from 'lucide-react'
import { useState } from 'react'

interface ProductSortFilterProps {
  categories: Array<{ id: string; name: string; slug: string }>
  brands: Array<{ brand: string | null }>
  activeFilters: {
    category?: string
    brand?: string
    stockStatus?: string
    minRating?: string
    minPrice?: string
    maxPrice?: string
  }
}

export default function ProductSortFilter({ categories, brands, activeFilters }: ProductSortFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset to first page on filter change
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/products')
  }

  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const uniqueBrands = brands
    .map((b) => b.brand)
    .filter((b): b is string => b !== null)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort()

  const hasActiveFilters = Object.values(activeFilters).some((v) => v)

  return (
    <div className="mb-6 space-y-4">
      {/* Sort and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-semibold text-gray-900">Sort by:</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                updateFilter('sortBy', field)
                updateFilter('sortOrder', order)
              }}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm focus:border-red-500 focus:outline-none"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="popularity-desc">Most Popular</option>
            </select>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {showFilters ? 'Hide' : 'Show'} Filters {hasActiveFilters && '●'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-semibold border border-gray-300"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
              <select
                value={activeFilters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Brand</label>
              <select
                value={activeFilters.brand || ''}
                onChange={(e) => updateFilter('brand', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Stock Status</label>
              <select
                value={activeFilters.stockStatus || ''}
                onChange={(e) => updateFilter('stockStatus', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="">All</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Rating</label>
              <select
                value={activeFilters.minRating || ''}
                onChange={(e) => updateFilter('minRating', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Star</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.category && (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Category: {categories.find((c) => c.slug === activeFilters.category)?.name || activeFilters.category}
              <button onClick={() => updateFilter('category', '')} className="hover:text-red-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeFilters.brand && (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Brand: {activeFilters.brand}
              <button onClick={() => updateFilter('brand', '')} className="hover:text-red-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeFilters.stockStatus && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Stock: {activeFilters.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
              <button onClick={() => updateFilter('stockStatus', '')} className="hover:text-green-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeFilters.minRating && (
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Rating: {activeFilters.minRating}+ Stars
              <button onClick={() => updateFilter('minRating', '')} className="hover:text-yellow-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(activeFilters.minPrice || activeFilters.maxPrice) && (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Price: KES {activeFilters.minPrice || '0'} - {activeFilters.maxPrice || '∞'}
              <button
                onClick={() => {
                  updateFilter('minPrice', '')
                  updateFilter('maxPrice', '')
                }}
                className="hover:text-red-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

