import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { Shield, Star, TrendingUp, Truck, Sparkles, Zap, Award, MessageSquare } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/home/ProductCard'
import AnimatedSection from '@/components/home/AnimatedSection'
import ReviewCard from '@/components/home/ReviewCard'
import { serializeProducts } from '@/lib/prisma-serialize'

async function getFeaturedData() {
  const [categories, featuredProducts, newArrivals, stats, reviewsCount, customerReviews] = await Promise.all([
    prisma.category.findMany({ take: 6, orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { images: { take: 1 }, category: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      include: { images: { take: 1 }, category: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.review.count(),
    prisma.review.findMany({
      include: {
        product: {
          select: {
            name: true,
            images: { take: 1, select: { url: true } },
          },
        },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
  ])
  return { categories, featuredProducts, newArrivals, stats, reviews: reviewsCount, customerReviews }
}

export default async function HomePage() {
  const { categories, featuredProducts, newArrivals, stats, reviews, customerReviews } = await getFeaturedData()
  const serializedFeatured = serializeProducts(featuredProducts)
  const serializedNewArrivals = serializeProducts(newArrivals)

  return (
    <div className="min-h-screen bg-gray-900">

      {/* Hero Section - Nightlife Theme */}
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
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
              <p className="text-gray-300">Paystack & secure checkout</p>
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
      <section className="py-16 bg-gray-900 border-y border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Shop by Category</h2>
              <p className="text-gray-400">Browse our wide selection of premium products</p>
            </div>
            <Link
              href="/products"
              className="text-blue-400 font-semibold hover:text-blue-300 transition"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 text-center hover:border-blue-500 hover:shadow-blue-500/20 transition-all hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-lg font-semibold text-white relative z-10 group-hover:text-blue-400 transition-colors">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {serializedNewArrivals.length > 0 && (
        <AnimatedSection direction="up" delay={100}>
          <section className="py-16 bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      New Arrivals
                    </h2>
                    <p className="text-gray-400">Fresh products just added to our collection</p>
                  </div>
                </div>
                <Link
                  href="/products?new=true"
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  View All <span>→</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {serializedNewArrivals.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

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
              <p className="text-gray-400">Paystack integration for safe and instant payments.</p>
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

      {/* Customer Reviews Section */}
      {customerReviews.length > 0 && (
        <AnimatedSection direction="up" delay={500}>
          <section className="py-16 bg-gray-900 border-t border-gray-700">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-purple-400" />
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      Customer Reviews
                    </h2>
                    <p className="text-gray-400">See what our customers are saying</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-gray-300 font-semibold ml-2">
                    {reviews}+ Reviews
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customerReviews.map((review, index) => (
                  <ReviewCard key={review.id} review={review} index={index} />
                ))}
              </div>
              {customerReviews.length >= 6 && (
                <div className="text-center mt-8">
                  <Link
                    href="/products"
                    className="inline-block text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    View More Reviews →
                  </Link>
                </div>
              )}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* CTA Section */}
      <AnimatedSection direction="up" delay={600}>
        <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 border-t border-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Ready to Shop?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Browse our complete catalog of premium shisha products and accessories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/products"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all text-lg shadow-lg hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transform duration-300"
              >
                Explore All Products
              </Link>
              <Link
                href="/categories"
                className="inline-block bg-gray-800 border-2 border-gray-700 text-white px-10 py-4 rounded-lg font-semibold hover:border-purple-500 hover:bg-gray-700 transition-all text-lg"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  )
}
