import { Metadata } from 'next'
import prisma, { withRetry } from '@/lib/prisma'
import BundlesGrid from '@/components/bundles/BundlesGrid'
import { Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Product Bundles - Special Deals | Mombasa Shisha Bongs',
  description: 'Shop our curated product bundles and save more. Special deals on shisha, vapes, and accessories in Mombasa.',
}

async function getAllBundles() {
  const bundles = await withRetry(() =>
    prisma.productBundle.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
                colors: { where: { isActive: true } },
                specifications: { where: { isActive: true } },
              },
            },
            color: true,
            specification: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  )

  // Serialize Decimal values to numbers
  return bundles.map((bundle) => ({
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    image: bundle.image,
    price: Number(bundle.price),
    discount: bundle.discount ? Number(bundle.discount) : null,
    items: bundle.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      colorId: item.colorId,
      specId: item.specId,
      allowColorSelection: item.allowColorSelection,
      allowSpecSelection: item.allowSpecSelection,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        image: item.product.images[0]?.url || item.product.featuredImage,
        slug: item.product.slug,
        colors: item.product.colors.map((c) => ({
          id: c.id,
          name: c.name,
          value: c.value,
        })),
        specifications: item.product.specifications.map((s) => ({
          id: s.id,
          type: s.type,
          name: s.name,
          value: s.value,
        })),
      },
      preselectedColor: item.color,
      preselectedSpec: item.specification,
    })),
  }))
}

export default async function BundlesPage() {
  const bundles = await getAllBundles()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600 p-3 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Product Bundles
              </h1>
              <p className="text-lg text-gray-700 font-semibold">
                Save more with our curated product bundles
              </p>
            </div>
          </div>
        </div>

        {bundles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bundles available</h3>
            <p className="text-gray-600 mb-6">Check back soon for special bundle deals!</p>
          </div>
        ) : (
          <BundlesGrid bundles={bundles} />
        )}
      </div>
    </div>
  )
}

