import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import SearchBar from '@/components/SearchBar'
import Navbar from '@/components/Navbar'

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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }>
}) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all"
                >
                  {product.images[0] ? (
                    <div className="relative h-64 bg-gray-800">
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-gray-700 to-gray-800" />
                  )}
                  <div className="p-5">
                    <p className="text-sm text-blue-400 font-semibold mb-1">{product.category.name}</p>
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-blue-400 font-bold text-xl">KES {product.price.toLocaleString()}</p>
                      {product.stock > 0 ? (
                        <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-full border border-green-700">In Stock</span>
                      ) : (
                        <span className="text-xs bg-red-900 text-red-400 px-2 py-1 rounded-full border border-red-700">Out of Stock</span>
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
  )
}
