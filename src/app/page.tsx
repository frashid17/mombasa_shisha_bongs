import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { Shield, Star, TrendingUp, Truck } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import Navbar from '@/components/Navbar'

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
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      {/* Hero Section - Nightlife Theme */}
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mombasa Shisha Bongs
            </h1>
            <p className="text-xl mb-8 text-gray-300">Premium Shisha, Vapes & Accessories in Kenya</p>
            <SearchBar />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center border border-white/20">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-300">Mpesa & secure checkout</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center border border-white/20">
              <Star className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-300">Authentic products guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-gray-800 border-y border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-400 mb-2">{stats}+</p>
              <p className="text-gray-300 font-semibold">Products</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-400 mb-2">{categories.length}</p>
              <p className="text-gray-300 font-semibold">Categories</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-pink-400 mb-2">100%</p>
              <p className="text-gray-300 font-semibold">Authentic</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-400 mb-2">24/7</p>
              <p className="text-gray-300 font-semibold">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Shop by Category</h2>
              <p className="text-gray-400">Browse our wide selection of premium products</p>
            </div>
            <Link
              href="/products"
              className="text-blue-400 font-semibold hover:text-blue-300"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-6 text-center hover:border-blue-500 hover:shadow-blue-500/20 transition-all"
              >
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Featured Products</h2>
              <p className="text-gray-400">Handpicked premium selections for you</p>
            </div>
            <Link
              href="/products"
              className="text-blue-400 font-semibold hover:text-blue-300"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all"
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
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-700">
                <Truck className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-400">Same-day delivery in Mombasa. Nationwide shipping available.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-700">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure Payment</h3>
              <p className="text-gray-400">Mpesa STK Push integration for safe and instant payments.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-700">
                <Star className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Quality</h3>
              <p className="text-gray-400">Only authentic, high-quality products from trusted suppliers.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-700">
                <TrendingUp className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Best Prices</h3>
              <p className="text-gray-400">Competitive pricing with regular discounts and offers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Shop?</h2>
          <p className="text-xl text-gray-400 mb-8">Browse our complete catalog of premium shisha products</p>
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
