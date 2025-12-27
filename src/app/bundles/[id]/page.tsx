import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma, { withRetry } from '@/lib/prisma'
import BundleDetail from '@/components/bundles/BundleDetail'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

async function getBundle(id: string) {
  const bundle = await withRetry(() =>
    prisma.productBundle.findUnique({
      where: { id },
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
                category: true,
              },
            },
            color: true,
            specification: true,
          },
        },
      },
    })
  )

  if (!bundle || !bundle.isActive) return null

  // Serialize Decimal values and transform data
  return {
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    image: bundle.image || null,
    price: Number(bundle.price),
    discount: bundle.discount ? Number(bundle.discount) : null,
    items: bundle.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      colorId: item.colorId,
      specId: item.specId,
      allowColorSelection: item.allowColorSelection ?? true,
      allowSpecSelection: item.allowSpecSelection ?? true,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        image: item.product.images[0]?.url || item.product.featuredImage,
        slug: item.product.slug,
        category: item.product.category,
        colors: item.product.colors.map((c: any) => ({
          id: c.id,
          name: c.name,
          value: c.value,
        })),
        specifications: item.product.specifications.map((s: any) => ({
          id: s.id,
          type: s.type,
          name: s.name,
          value: s.value,
        })),
      },
      preselectedColor: item.color,
      preselectedSpec: item.specification,
    })),
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const bundle = await getBundle(id)

  if (!bundle) {
    return {
      title: 'Bundle Not Found | Mombasa Shisha Bongs',
    }
  }

  return {
    title: `${bundle.name} - Product Bundle | Mombasa Shisha Bongs`,
    description: bundle.description || `Special bundle deal: ${bundle.name}. Save on premium shisha and vape products.`,
    openGraph: {
      title: `${bundle.name} - Product Bundle`,
      description: bundle.description || `Special bundle deal: ${bundle.name}`,
      images: bundle.image ? [bundle.image] : [],
    },
  }
}

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const bundle = await getBundle(id)

  if (!bundle) {
    notFound()
  }

  const totalIndividualPrice = bundle.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )
  const savings = totalIndividualPrice - bundle.price
  const savingsPercent = ((savings / totalIndividualPrice) * 100).toFixed(0)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back Link */}
        <Link
          href="/bundles"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bundles
        </Link>

        <BundleDetail
          bundle={bundle}
          totalIndividualPrice={totalIndividualPrice}
          savings={savings}
          savingsPercent={savingsPercent}
        />
      </div>
    </div>
  )
}

