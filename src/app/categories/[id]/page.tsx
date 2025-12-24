import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import StructuredData from '@/components/seo/StructuredData'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

async function getCategoryProducts(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      products: {
        where: { isActive: true },
        include: { images: { take: 1 }, category: true },
        orderBy: { createdAt: 'desc' },
        take: 24, // Limit to first 24 products to avoid loading huge lists
      },
    },
  })
  return category
}

async function getCategoryMeta(categoryId: string) {
  return prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
    },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const category = await getCategoryMeta(id)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  const categoryUrl = `${siteUrl}/categories/${id}`
  const categoryImage = category.image || '/logo.png'

  return {
    title: `${category.name} - Shop Premium ${category.name} in Mombasa`,
    description: category.description || `Browse our collection of premium ${category.name.toLowerCase()} in Mombasa, Kenya. Fast delivery, authentic products, secure payment.`,
    openGraph: {
      title: `${category.name} - Mombasa Shisha Bongs`,
      description: category.description || `Premium ${category.name.toLowerCase()} in Mombasa, Kenya`,
      url: categoryUrl,
      images: [categoryImage.startsWith('http') ? categoryImage : `${siteUrl}${categoryImage}`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - Mombasa Shisha Bongs`,
      description: category.description || `Premium ${category.name.toLowerCase()} in Mombasa`,
      images: [categoryImage.startsWith('http') ? categoryImage : `${siteUrl}${categoryImage}`],
    },
    alternates: {
      canonical: categoryUrl,
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await getCategoryProducts(id)

  if (!category) {
    notFound()
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: category.name, url: `/categories/${id}` },
  ]

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbs} />
      <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 text-lg">{category.description}</p>
          )}
        </div>
        {category.products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">No products in this category yet.</p>
            <Link
              href="/products"
              className="inline-block text-red-600 hover:text-red-700 font-semibold"
            >
              Browse All Products →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Found {category.products.length} product{category.products.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:border-red-500 hover:shadow-md transition-all"
                >
                  {product.images[0] ? (
                    <div className="relative h-64 bg-white">
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-gray-50" />
                  )}
                  <div className="p-5">
                    {product.category && (
                      <p className="text-sm text-red-600 font-semibold mb-1">{product.category.name}</p>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 font-bold text-xl">KES {product.price.toLocaleString()}</p>
                      {product.stock > 0 ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">In Stock</span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full border border-red-200">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}

