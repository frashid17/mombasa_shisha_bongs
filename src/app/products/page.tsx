import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import SearchBar from '@/components/SearchBar'
import ProductsGrid from '@/components/products/ProductsGrid'
import { serializeProducts } from '@/lib/prisma-serialize'
import StructuredData from '@/components/seo/StructuredData'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

async function getProducts(searchParams: {
  search?: string
  category?: string
  minPrice?: string
  maxPrice?: string
}) {
  const where: any = { isActive: true }

  // Search filter - MySQL is case-insensitive by default with utf8mb4_unicode_ci
  if (searchParams.search) {
    const searchTerm = searchParams.search.trim()
    where.OR = [
      { name: { contains: searchTerm } },
      { description: { contains: searchTerm } },
      { sku: { contains: searchTerm } },
      { tags: { contains: searchTerm } },
    ]
  }

  // Category filter
  if (searchParams.category) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: searchParams.category },
          { name: { contains: searchParams.category } },
        ],
        isActive: true,
      },
    })
    if (category) {
      where.categoryId = category.id
    }
  }

  // Price range filter
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {}
    if (searchParams.minPrice) {
      where.price.gte = parseFloat(searchParams.minPrice)
    }
    if (searchParams.maxPrice) {
      where.price.lte = parseFloat(searchParams.maxPrice)
    }
  }

  return prisma.product.findMany({
    where,
    include: { images: { take: 1 }, category: true },
    orderBy: { createdAt: 'desc' },
  })
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = !!(params.search || params.category || params.minPrice || params.maxPrice)
  
  let title = 'All Products - Shop Premium Shisha & Vapes in Mombasa'
  let description = 'Browse our complete collection of premium shisha, vapes, and smoking accessories in Mombasa, Kenya. Fast delivery, authentic products, secure payment.'

  if (params.search) {
    title = `Search Results for "${params.search}" - Mombasa Shisha Bongs`
    description = `Find the best ${params.search} products in Mombasa. Premium quality, fast delivery, secure payment.`
  } else if (params.category) {
    title = `${params.category} - Shop Premium ${params.category} in Mombasa`
    description = `Browse our collection of premium ${params.category.toLowerCase()} in Mombasa, Kenya.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products${hasFilters ? `?${new URLSearchParams(params as any).toString()}` : ''}`,
      images: ['/logo.png'],
    },
    alternates: {
      canonical: `${siteUrl}/products${hasFilters ? `?${new URLSearchParams(params as any).toString()}` : ''}`,
    },
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }>
}) {
  const params = await searchParams
  const [rawProducts, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const products = serializeProducts(rawProducts)

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
  ]

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbs} />
      <div className="min-h-screen bg-gray-900">
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">All Products</h1>
          <SearchBar />
        </div>

        {/* Active Filters */}
        {(params.search || params.category || params.minPrice || params.maxPrice) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {params.search && (
              <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm">
                Search: {params.search}
              </span>
            )}
            {params.category && (
              <span className="bg-purple-900 text-purple-300 px-3 py-1 rounded-full text-sm">
                Category: {params.category}
              </span>
            )}
            {(params.minPrice || params.maxPrice) && (
              <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm">
                Price: KES {params.minPrice || '0'} - {params.maxPrice || '∞'}
              </span>
            )}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No products found</p>
            <Link
              href="/products"
              className="inline-block mt-4 text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Found {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
            <ProductsGrid products={products} />
          </>
        )}
      </div>
    </div>
    </>
  )
}
