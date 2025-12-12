import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import SearchBar from '@/components/SearchBar'

async function getProducts(search?: string) {
  const where: any = { isActive: true }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }
  return prisma.product.findMany({
    where,
    include: { images: { take: 1 }, category: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const products = await getProducts(searchParams.search)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
        <SearchBar />
      </div>
      {searchParams.search && (
        <p className="text-gray-600 mb-6">
          Found {products.length} product{products.length !== 1 ? 's' : ''} for "{searchParams.search}"
        </p>
      )}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No products found</p>
          <Link
            href="/products"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:scale-105"
            >
              {product.images[0] ? (
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
              )}
              <div className="p-5">
                <p className="text-sm text-blue-600 font-semibold mb-1">{product.category.name}</p>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-blue-600 font-bold text-xl">KES {product.price.toLocaleString()}</p>
                  {product.stock > 0 ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">In Stock</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Out of Stock</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
