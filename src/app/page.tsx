import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { ShoppingCart } from 'lucide-react'

async function getFeaturedData() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({ take: 4, orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { images: { take: 1 }, category: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
  ])
  return { categories, featuredProducts }
}

export default async function HomePage() {
  const { categories, featuredProducts } = await getFeaturedData()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Mombasa Shisha Bongs</h1>
          <p className="text-xl mb-8">Premium Shisha, Vapes & Accessories</p>
          <Link
            href="/products"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
