import prisma, { withRetry } from '@/lib/prisma'
import BundleForm from '@/components/admin/bundles/BundleForm'
import { notFound } from 'next/navigation'

async function getBundle(id: string) {
  const bundle = await withRetry(() =>
    prisma.productBundle.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                colors: { where: { isActive: true } },
                specifications: { where: { isActive: true } },
              },
            },
          },
        },
      },
    })
  )

  if (!bundle) return null

  // Transform to match Bundle interface
  const bundleData = bundle as any
  return {
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    image: bundleData.image || null,
    price: Number(bundle.price),
    discount: bundle.discount ? Number(bundle.discount) : null,
    isActive: bundle.isActive,
    items: bundle.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      colorId: item.colorId || null,
      specId: item.specId || null,
      allowColorSelection: item.allowColorSelection ?? true,
      allowSpecSelection: item.allowSpecSelection ?? true,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        featuredImage: item.product.featuredImage,
        colors: (item.product.colors || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          value: c.value,
        })),
        specifications: (item.product.specifications || []).map((s: any) => ({
          id: s.id,
          type: s.type,
          name: s.name,
          value: s.value,
        })),
      },
    })),
  }
}

export default async function EditBundlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const bundle = await getBundle(id)

  if (!bundle) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product Bundle</h1>
        <p className="text-gray-700 mt-1">Update bundle details and products</p>
      </div>
      <BundleForm bundle={bundle} />
    </div>
  )
}

