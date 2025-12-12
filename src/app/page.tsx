import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { Shield, Star, TrendingUp, Truck } from 'lucide-react'
import SearchBar from '@/components/SearchBar'

async function getFeaturedData() {
  const [categories, featuredProducts, stats] = await Promise.all([
    prisma.category.findMany({ take: 6, orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { images: { take: 1 }, category: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where: { isActive: true } }),
  ])
  return { categories, featuredProducts, stats }
}

export default async function HomePage() {
  const { categories, featuredProducts, stats } = await getFeaturedData()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4">Mombasa Shisha Bongs</h1>
            <p className="text-xl mb-8 opacity-90">Premium Shisha, Vapes & Accessories in Kenya</p>
            <SearchBar />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="opacity-90">Mpesa & secure checkout</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="opacity-90">Authentic products guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">{stats}+</p>
              <p className="text-gray-700 font-semibold">Products</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">{categories.length}</p>
              <p className="text-gray-700 font-semibold">Categories</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">100%</p>
              <p className="text-gray-700 font-semibold">Authentic</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">24/7</p>
              <p className="text-gray-700 font-semibold">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Shop by Category</h2>
              <p className="text-gray-600">Browse our wide selection of premium products</p>
            </div>
            <Link
              href="/products"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center hover:shadow-md transition-all hover:border-blue-300"
              >
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked premium selections for you</p>
            </div>
            <Link
              href="/products"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
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
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Same-day delivery in Mombasa. Nationwide shipping available.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600">Mpesa STK Push integration for safe and instant payments.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">Only authentic, high-quality products from trusted suppliers.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with regular discounts and offers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Shop?</h2>
          <p className="text-xl text-gray-600 mb-8">Browse our complete catalog of premium shisha products</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
          >
            Explore All Products
          </Link>
        </div>
      </section>
    </div>
  )
}
