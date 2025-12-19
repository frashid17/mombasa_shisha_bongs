'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCurrency } from '@/contexts/CurrencyContext'

interface Product {
  id: string
  name: string
  price: number
  images: Array<{ url: string }>
  category: { name: string }
}

export default function FrequentlyBoughtTogether({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addToCart = useCartStore((state) => state.addItem)
  const { format } = useCurrency()

  useEffect(() => {
    fetch(`/api/products/${productId}/frequently-bought-together`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [productId])

  if (loading || products.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">Frequently Bought Together</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all"
          >
            <Link href={`/products/${product.id}`}>
              {product.images[0] ? (
                <div className="relative h-48 bg-gray-800">
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800" />
              )}
            </Link>
            <div className="p-4">
              <p className="text-sm text-blue-400 font-semibold mb-1">{product.category.name}</p>
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-white mb-2 line-clamp-2 hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between">
                <p className="text-blue-400 font-bold">{format(product.price)}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Add to cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

