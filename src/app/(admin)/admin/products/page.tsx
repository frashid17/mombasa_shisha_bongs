import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/prisma'
import ProductsTable from '@/components/admin/products/ProductsTable'

async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      images: { take: 1 },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-8">Loading products...</div>}>
        <ProductsTable products={products} />
      </Suspense>
    </div>
  )
}

