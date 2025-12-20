import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Shield, Star, TrendingUp, Truck, Sparkles, Zap, Award, MessageSquare } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/home/ProductCard'
import AnimatedSection from '@/components/home/AnimatedSection'
import ReviewCard from '@/components/home/ReviewCard'
import RecentlyViewed from '@/components/home/RecentlyViewed'
import { serializeProducts } from '@/lib/prisma-serialize'
import CategoryImage from '@/components/categories/CategoryImage'
import CountdownTimer from '@/components/flash-sales/CountdownTimer'

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

async function getActiveFlashSales() {
  const now = new Date()

  const flashSales = await prisma.flashSale.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { endDate: 'asc' },
  })

  if (flashSales.length === 0) return []

  const flashSalesWithProducts = await Promise.all(
    flashSales.map(async (sale) => {
      const productIds = JSON.parse(sale.productIds) as string[]
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: {
          images: { take: 1 },
          category: true,
        },
      })

      return {
        id: sale.id,
        title: sale.title,
        description: sale.description,
        discountPercent: Number(sale.discountPercent),
        startDate: sale.startDate,
        endDate: sale.endDate,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          images: p.images,
          category: p.category,
          stock: p.stock,
        })),
      }
    })
  )

  return flashSalesWithProducts
}

export default async function HomePage() {
  const { categories, featuredProducts, newArrivals, stats, reviews, customerReviews } = await getFeaturedData()
  const serializedFeatured = serializeProducts(featuredProducts)
  const serializedNewArrivals = serializeProducts(newArrivals)
  const activeFlashSales = await getActiveFlashSales()
  const primaryFlashSale = activeFlashSales[0]

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

      {/* Flash Sale Section */}
      {primaryFlashSale && primaryFlashSale.products.length > 0 && (
        <section className="py-10 bg-gradient-to-r from-red-900 via-purple-900 to-gray-900 border-y border-red-700/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/40">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {primaryFlashSale.title || 'Flash Sale'}
                  </h2>
                  <p className="text-red-300 font-semibold">
                    Up to {primaryFlashSale.discountPercent}% OFF • Limited Time Only
                  </p>
                  {primaryFlashSale.description && (
                    <p className="text-gray-200 mt-2 max-w-xl">
                      {primaryFlashSale.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <CountdownTimer endDate={primaryFlashSale.endDate} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {primaryFlashSale.products.slice(0, 4).map((product, index) => {
                const discountedPrice =
                  Math.round(product.price * (1 - primaryFlashSale.discountPercent / 100))

                const productForCard = {
                  ...product,
                  compareAtPrice: product.compareAtPrice ?? product.price,
                  price: discountedPrice,
                }

                return (
                  <ProductCard key={product.id} product={productForCard} index={index} />
                )
              })}
            </div>
          </div>
        </section>
      )}

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
            {categories.map((category) => {
              // Get placeholder image based on category name
              const getCategoryImage = (name: string) => {
                const nameLower = name.toLowerCase()
                if (nameLower.includes('shisha') || nameLower.includes('hookah')) {
                  // Shisha hookah image
                  return 'https://images.unsplash.com/photo-1761839257287-3030c9300ece?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                }
                if (nameLower.includes('vape')) {
                  // Vape device image - red and black box mod
                  // Source: https://unsplash.com/photos/red-and-black-box-mod-M8CrCzlS78Y
                  return 'https://images.unsplash.com/photo-1555697863-80a30c6e4bc1?w=400&h=300&fit=crop&q=80'
                }
                if (nameLower.includes('tobacco')) {
                  // Nicotine pouch image - using a nicotine pouch/snus image
                  return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop&q=80'
                }
                if (nameLower.includes('accessor')) {
                  // Vape coil image - using a vape coil/accessories close-up
                  return 'https://images.unsplash.com/photo-1591522810163-d1e3cbf1c888?w=400&h=300&fit=crop&q=80'
                }
                // Default placeholder
                return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop&q=80'
              }

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all hover:scale-105 group relative"
                >
                  <div className="relative h-32 bg-gray-800">
                    <CategoryImage
                      src={category.image || getCategoryImage(category.name)}
                      alt={category.name}
                      className={`object-cover group-hover:scale-110 transition-transform duration-300 ${!category.image ? 'opacity-80' : ''}`}
                      unoptimized={category.image ? (category.image.startsWith('http') && !category.image.includes('localhost')) : true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                  </div>
                  <div className="p-4 text-center relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-sm font-semibold text-white relative z-10 group-hover:text-blue-400 transition-colors line-clamp-2">{category.name}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {serializedFeatured.length > 0 && (
        <AnimatedSection direction="up" delay={50}>
          <section className="py-16 bg-gray-900 border-t border-gray-800">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                      Featured Products
                    </h2>
                    <p className="text-gray-400">Handpicked premium selections for you</p>
                  </div>
                </div>
                <Link
                  href="/products?featured=true"
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  View All <span>→</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {serializedFeatured.slice(0, 8).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

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

      {/* Recently Viewed Section */}
      <RecentlyViewed />
    </div>
  )
}
