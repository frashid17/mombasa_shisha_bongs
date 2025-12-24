import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/prisma'
import ProductsTable from '@/components/admin/products/ProductsTable'
import CleanupButton from '@/components/admin/products/CleanupButton'
import { serializeProducts } from '@/lib/prisma-serialize'

async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { take: 1 },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200, // Limit to most recent 200 products to avoid loading huge catalogs at once
  })
  
  // Convert Decimal to number for client components
  return serializeProducts(products)
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-700 mt-1 text-sm sm:text-base">Manage your product catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <CleanupButton />
          <Link
            href="/admin/products/new"
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm sm:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-8">Loading products...</div>}>
        <ProductsTable products={products} />
      </Suspense>
    </div>
  )
}

