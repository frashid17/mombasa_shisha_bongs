import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'

async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { images: { take: 1 }, category: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
          >
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200" />
            )}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-1">{product.category.name}</p>
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-blue-600 font-bold text-lg">KES {product.price.toLocaleString()}</p>
              {product.stock > 0 ? (
                <p className="text-sm text-green-600 mt-1">In Stock</p>
              ) : (
                <p className="text-sm text-red-600 mt-1">Out of Stock</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

