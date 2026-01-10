'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Package, Tag, Hash, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Suggestion {
  type: 'product' | 'category' | 'brand'
  id: string
  title: string
  subtitle?: string
  image?: string
  url: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recent-searches')
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved))
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=8`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query.trim()
    if (!searchTerm) return

    // Save to recent searches
    if (typeof window !== 'undefined') {
      const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5)
      localStorage.setItem('recent-searches', JSON.stringify(updated))
      setRecentSearches(updated)
    }

    // Navigate to products page with search
    router.push(`/products?search=${encodeURIComponent(searchTerm)}`)
    onClose()
    setQuery('')
  }

  const handleSuggestionClick = (url: string) => {
    onClose()
    setQuery('')
    router.push(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in pt-20 md:pt-32"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-gray-200 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              id="modal-search"
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for shisha, vapes, accessories..."
              autoComplete="off"
              aria-label="Search products in modal"
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-300 rounded-md focus:border-red-500 focus:outline-none text-gray-900 text-lg placeholder-gray-500"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
              </div>
            )}
            {query && !loading && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Suggestions */}
          {query.length >= 2 && suggestions.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Suggestions
              </h3>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion.url)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-md transition-colors text-left"
                  >
                    {suggestion.image ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={suggestion.image}
                          alt={suggestion.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {suggestion.type === 'category' ? (
                          <Tag className="w-6 h-6 text-gray-600" />
                        ) : suggestion.type === 'brand' ? (
                          <Hash className="w-6 h-6 text-gray-600" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-semibold truncate">{suggestion.title}</p>
                      {suggestion.subtitle && (
                        <p className="text-sm text-gray-600 truncate">{suggestion.subtitle}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">{suggestion.type}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {query.length < 2 && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Shisha Flavors', 'Disposable Vapes', 'Hookah Accessories', 'E-Liquids', 'Vape Kits'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !loading && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No results found for "{query}"</p>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </div>
          )}

          {/* Search Button */}
          {query.trim() && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => handleSearch()}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search for "{query}"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

