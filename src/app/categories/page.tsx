import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import Navbar from '@/components/Navbar'

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            All Categories
          </h1>
          <p className="text-gray-400 text-lg">Browse our complete selection of product categories</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No categories available yet.</p>
            <Link
              href="/products"
              className="inline-block text-blue-400 hover:text-blue-300 font-semibold"
            >
              Browse All Products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all hover:scale-105 group relative"
              >
                {category.image ? (
                  <div className="relative h-48 bg-gray-800">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-700 via-purple-900/30 to-blue-900/30 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <span className="text-4xl">🪔</span>
                    </div>
                  </div>
                )}
                <div className="p-6 relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-400 mb-4 line-clamp-2">{category.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-400 font-semibold">
                      {category._count.products} product{category._count.products !== 1 ? 's' : ''}
                    </span>
                    <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
                      View →
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

