import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import SearchBar from '@/components/SearchBar'
import ProductsGrid from '@/components/products/ProductsGrid'
import ProductSortFilter from '@/components/products/ProductSortFilter'
import ProductPagination from '@/components/products/ProductPagination'
import { serializeProducts } from '@/lib/prisma-serialize'
import StructuredData from '@/components/seo/StructuredData'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

async function getProducts(searchParams: {
  search?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  brand?: string
  stockStatus?: string
  minRating?: string
  sortBy?: string
  sortOrder?: string
  page?: string
  limit?: string
}) {
  const where: any = { isActive: true }

  // Search filter
  if (searchParams.search) {
    const searchTerm = searchParams.search.trim()
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { sku: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { contains: searchTerm, mode: 'insensitive' } },
      { brand: { contains: searchTerm, mode: 'insensitive' } },
    ]
  }

  // Category filter
  if (searchParams.category) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: searchParams.category },
          { name: { contains: searchParams.category, mode: 'insensitive' } },
        ],
        isActive: true,
      },
    })
    if (category) {
      where.categoryId = category.id
    }
  }

  // Brand filter
  if (searchParams.brand) {
    where.brand = { contains: searchParams.brand, mode: 'insensitive' }
  }

  // Stock status filter
  if (searchParams.stockStatus === 'in_stock') {
    where.stock = { gt: 0 }
  } else if (searchParams.stockStatus === 'out_of_stock') {
    where.stock = { lte: 0 }
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

  // Rating filter (requires join with reviews)
  if (searchParams.minRating) {
    const minRating = parseFloat(searchParams.minRating)
    const productsWithRatings = await prisma.review.groupBy({
      by: ['productId'],
      having: {
        rating: {
          _avg: {
            gte: minRating,
          },
        },
      },
    })
    const productIds = productsWithRatings.map((r) => r.productId)
    if (productIds.length > 0) {
      where.id = { in: productIds }
    } else {
      // No products match the rating, return empty
      where.id = { in: [] }
    }
  }

  // Sorting
  const sortBy = searchParams.sortBy || 'createdAt'
  const sortOrder = (searchParams.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  // Pagination
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '24')
  const skip = (page - 1) * limit

  // Build orderBy for Prisma
  let orderBy: any
  if (sortBy === 'popularity') {
    // Sort by number of order items (sales count)
    orderBy = { orderItems: { _count: sortOrder } }
  } else if (sortBy === 'price') {
    orderBy = { price: sortOrder }
  } else if (sortBy === 'name') {
    orderBy = { name: sortOrder }
  } else if (sortBy === 'createdAt') {
    orderBy = { createdAt: sortOrder }
  } else {
    // Default to createdAt desc
    orderBy = { createdAt: 'desc' as 'desc' }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { take: 1 },
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, page, limit }
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string; brand?: string; sortBy?: string }> }): Promise<Metadata> {
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
  searchParams: Promise<{ 
    search?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    brand?: string
    stockStatus?: string
    minRating?: string
    sortBy?: string
    sortOrder?: string
    page?: string
    limit?: string
  }>
}) {
  const params = await searchParams
  const [productsData, categories, brands] = await Promise.all([
    getProducts(params),
    getCategories(),
    prisma.product.findMany({
      where: { isActive: true, brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
    }),
  ])

  const products = serializeProducts(productsData.products)
  const totalProducts = productsData.total
  const currentPage = productsData.page
  const totalPages = Math.ceil(totalProducts / productsData.limit)

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
  ]

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbs} />
      <div className="min-h-screen bg-white">
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">All Products</h1>
          <SearchBar />
        </div>

        {/* Sort and Filters */}
        <ProductSortFilter
          categories={categories}
          brands={brands}
          activeFilters={{
            category: params.category,
            brand: params.brand,
            stockStatus: params.stockStatus,
            minRating: params.minRating,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
          }}
        />

        {/* Search Active Filter */}
        {params.search && (
          <div className="mb-4">
            <span className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold">
              Search: {params.search}
            </span>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-700 text-lg mb-2 font-semibold">No products found</p>
            <p className="text-gray-600 text-sm mb-4">Try adjusting your filters or search terms</p>
            <Link
              href="/products"
              className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-semibold shadow-md transition-all duration-300"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <>
            <ProductsGrid products={products} />
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalProducts={totalProducts}
              limit={productsData.limit}
            />
          </>
        )}
      </div>
    </div>
    </>
  )
}
