import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import StructuredData from '@/components/seo/StructuredData'
import ProductCard from '@/components/home/ProductCard'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

async function getCategoryProducts(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      products: {
        where: { isActive: true },
        include: { 
          images: { take: 1 }, 
          category: true,
          specifications: {
            where: { isActive: true },
            orderBy: [{ type: 'asc' }, { position: 'asc' }],
          },
        },
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                    images: product.images.map(img => ({ url: img.url, altText: img.altText })),
                    category: product.category ? {
                      name: product.category.name,
                    } : null,
                    stock: product.stock,
                    specifications: product.specifications?.map((spec: any) => ({
                      id: spec.id,
                      type: spec.type,
                      name: spec.name,
                      value: spec.value,
                      price: spec.price ? Number(spec.price) : null,
                      isActive: spec.isActive,
                    })) || [],
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}

