import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import SearchBar from '@/components/SearchBar'
import Navbar from '@/components/Navbar'

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
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">All Products</h1>
          <SearchBar />
        </div>
        {searchParams.search && (
          <p className="text-gray-400 mb-6">
            Found {products.length} product{products.length !== 1 ? 's' : ''} for "{searchParams.search}"
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all"
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
        )}
      </div>
    </div>
  )
}
