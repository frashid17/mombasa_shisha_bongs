import Link from 'next/link'
import prisma from '@/lib/prisma'
import CategoryImage from '@/components/categories/CategoryImage'

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

// Helper function to get placeholder image based on category name
function getCategoryPlaceholderImage(name: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('shisha') || nameLower.includes('hookah')) {
    // Shisha hookah image
    return 'https://images.unsplash.com/photo-1621264448270-9ef00e88a935?w=600&h=400&fit=crop&q=80'
  }
  if (nameLower.includes('vape')) {
    // Vape device image - red and black box mod
    // Source: https://unsplash.com/photos/red-and-black-box-mod-M8CrCzlS78Y
    return 'https://images.unsplash.com/photo-1555697863-80a30c6e4bc1?w=600&h=400&fit=crop&q=80'
  }
  if (nameLower.includes('tobacco')) {
    // Nicotine pouch image
    return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop&q=80'
  }
  if (nameLower.includes('accessor')) {
    // Vape coil/accessories image
    return 'https://images.unsplash.com/photo-1591522810163-d1e3cbf1c888?w=600&h=400&fit=crop&q=80'
  }
  // Default placeholder
  return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop&q=80'
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-900">
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
                <div className="relative h-64 md:h-80 bg-gray-800">
                  <CategoryImage
                    src={category.image || getCategoryPlaceholderImage(category.name)}
                    alt={category.name}
                    className={`object-contain group-hover:scale-105 transition-transform duration-300 ${!category.image ? 'opacity-80' : ''}`}
                    unoptimized={category.image ? (category.image.startsWith('http') && !category.image.includes('localhost')) : true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent pointer-events-none"></div>
                </div>
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

