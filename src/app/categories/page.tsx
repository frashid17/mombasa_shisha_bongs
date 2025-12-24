import Link from 'next/link'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import CategoryImage from '@/components/categories/CategoryImage'
import StructuredData from '@/components/seo/StructuredData'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

export const metadata: Metadata = {
  title: 'All Categories - Browse Shisha & Vape Categories',
  description: 'Browse all product categories at Mombasa Shisha Bongs. Shop shisha flavors, disposable vapes, hookahs, accessories, coals, refillable vapes, and e-liquids in Mombasa, Kenya.',
  openGraph: {
    title: 'All Categories - Mombasa Shisha Bongs',
    description: 'Browse all product categories. Shop shisha, vapes, and accessories in Mombasa, Kenya.',
    url: `${siteUrl}/categories`,
    images: ['/logo.png'],
  },
  alternates: {
    canonical: `${siteUrl}/categories`,
  },
}

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

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
  ]

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbs} />
      <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            All Categories
          </h1>
          <p className="text-gray-600 text-lg">Browse our complete selection of product categories</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">No categories available yet.</p>
            <Link
              href="/products"
              className="inline-block text-red-600 hover:text-red-700 font-semibold"
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
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:border-red-500 hover:shadow-lg transition-all hover:scale-[1.02] group relative"
              >
                <div className="relative h-64 md:h-80 bg-gray-50 overflow-hidden">
                  <CategoryImage
                    src={category.image || getCategoryPlaceholderImage(category.name)}
                    alt={category.name}
                    className={`object-cover group-hover:scale-110 transition-transform duration-500 ${!category.image ? 'opacity-80' : ''}`}
                    unoptimized={category.image ? (category.image.startsWith('http') && !category.image.includes('localhost')) : true}
                  />
                </div>
                <div className="p-6 relative z-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-semibold">
                      {category._count.products} product{category._count.products !== 1 ? 's' : ''}
                    </span>
                    <span className="text-red-600 group-hover:text-red-700 transition-colors">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

