'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

export default function RecentlyViewed() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { format } = useCurrency()

  useEffect(() => {
    // Get session ID from localStorage or generate one
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `guest-${Date.now()}`
      localStorage.setItem('sessionId', sessionId)
    }

    fetch(`/api/recently-viewed?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || products.length === 0) return null

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-600 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-red-600">Continue Browsing</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-red-500 hover:shadow-xl transition-all flex flex-col"
            >
              {product.images[0] ? (
                <div className="relative h-32 bg-white">
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gray-50" />
              )}
              <div className="p-2 bg-white flex-1 flex flex-col">
                <p className="text-xs text-gray-900 line-clamp-1 font-medium mb-1">{product.name}</p>
                <p className="text-sm font-bold text-gray-900">{format(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

