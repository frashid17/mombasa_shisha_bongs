import Link from 'next/link'
import prisma, { withRetry } from '@/lib/prisma'
import { Plus, Package, Edit, Trash2 } from 'lucide-react'
import BundlesTable from '@/components/admin/bundles/BundlesTable'

async function getBundles() {
  const bundles = await withRetry(() =>
    prisma.productBundle.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                featuredImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  )

  // Serialize Decimal values to numbers for client component
  return bundles.map((bundle) => ({
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    image: bundle.image,
    price: Number(bundle.price),
    discount: bundle.discount ? Number(bundle.discount) : null,
    isActive: bundle.isActive,
    createdAt: bundle.createdAt,
    items: bundle.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        featuredImage: item.product.featuredImage,
      },
    })),
  }))
}

export default async function BundlesPage() {
  const bundles = await getBundles()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Bundles</h1>
          <p className="text-gray-700 mt-1 text-sm sm:text-base">Create and manage product bundles</p>
        </div>
        <Link
          href="/admin/bundles/new"
          className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Create Bundle</span>
        </Link>
      </div>

      {bundles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No bundles yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Create your first product bundle to increase average order value.</p>
          <Link
            href="/admin/bundles/new"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create Bundle</span>
          </Link>
        </div>
      ) : (
        <BundlesTable bundles={bundles} />
      )}
    </div>
  )
}

