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
        include: { images: { take: 1 } },
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{category.name}</h1>
      {category.description && (
        <p className="text-gray-700 mb-8">{category.description}</p>
      )}
      {category.products.length === 0 ? (
        <p className="text-gray-600">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {category.products.map((product) => (
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
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-blue-600 font-bold text-lg">KES {product.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

