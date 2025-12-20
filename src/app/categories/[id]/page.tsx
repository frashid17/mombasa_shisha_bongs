import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'

async function getCategoryProducts(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      products: {
        where: { isActive: true },
        include: { images: { take: 1 }, category: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  return category
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await getCategoryProducts(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-400 text-lg">{category.description}</p>
          )}
        </div>
        {category.products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No products in this category yet.</p>
            <Link
              href="/products"
              className="inline-block text-blue-400 hover:text-blue-300 font-semibold"
            >
              Browse All Products →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Found {category.products.length} product{category.products.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all hover:scale-105"
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
                    {product.category && (
                      <p className="text-sm text-blue-400 font-semibold mb-1">{product.category.name}</p>
                    )}
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-blue-400 font-bold text-xl">KES {product.price.toLocaleString()}</p>
                      {product.stock > 0 ? (
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-700">In Stock</span>
                      ) : (
                        <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full border border-red-700">Out of Stock</span>
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

