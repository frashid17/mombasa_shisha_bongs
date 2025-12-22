'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/home/ProductCard'
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton'

interface CustomersAlsoBoughtProps {
  productId: string
}

export default function CustomersAlsoBought({ productId }: CustomersAlsoBoughtProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAlsoBought() {
      try {
        const res = await fetch(`/api/products/${productId}/also-bought`)
        const data = await res.json()
        if (data.success && data.products) {
          setProducts(data.products)
        }
      } catch (error) {
        console.error('Failed to fetch also bought products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlsoBought()
  }, [productId])

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Customers Also Bought</h2>
        <ProductGridSkeleton count={4} />
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">Customers Also Bought</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 4).map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  )
}

