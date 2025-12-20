import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Shield, Star, TrendingUp, Truck, Sparkles, Zap, Award, MessageSquare, Package, ShoppingBag } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/home/ProductCard'
import AnimatedSection from '@/components/home/AnimatedSection'
import ReviewCard from '@/components/home/ReviewCard'
import RecentlyViewed from '@/components/home/RecentlyViewed'
import NewsletterSignup from '@/components/home/NewsletterSignup'
import FAQ from '@/components/home/FAQ'
import ExpertTips from '@/components/home/ExpertTips'
import CategoryPromoCard from '@/components/home/CategoryPromoCard'
import { serializeProducts } from '@/lib/prisma-serialize'
import CategoryImage from '@/components/categories/CategoryImage'
import CountdownTimer from '@/components/flash-sales/CountdownTimer'
import Image from 'next/image'

async function getFeaturedData() {
  // Calculate date for "new arrivals" (products created in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get top-selling products for "featured" (based on order items)
  const topSellingProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 8,
  })

  const featuredProductIds = topSellingProducts.map((item) => item.productId)
  const featuredProductIdMap = new Map(
    topSellingProducts.map((item, index) => [item.productId, index])
  )

  const [categories, featuredProducts, newArrivals, stats, reviewsCount, customerReviews] = await Promise.all([
    prisma.category.findMany({ take: 6, orderBy: { name: 'asc' } }),
    // Featured products: Top-selling products (automatically determined by sales)
    featuredProductIds.length > 0
      ? prisma.product.findMany({
          where: {
            isActive: true,
            id: { in: featuredProductIds },
          },
          include: {
            images: { take: 1 },
            category: true,
            _count: {
              select: {
                orderItems: true,
              },
            },
          },
          take: 8,
          orderBy: featuredProductIds.length > 0
            ? undefined
            : { createdAt: 'desc' },
        })
      : // Fallback: If no sales yet, show recently created products
        prisma.product.findMany({
          where: { isActive: true },
          include: { images: { take: 1 }, category: true },
          take: 8,
          orderBy: { createdAt: 'desc' },
        }),
    // New arrivals: Products created in the last 30 days (automatically determined by date)
    prisma.product.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
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

  // Sort featured products by their sales order (top sellers first)
  const sortedFeaturedProducts = featuredProductIds.length > 0
    ? [...featuredProducts].sort((a, b) => {
        const aIndex = featuredProductIdMap.get(a.id) ?? Infinity
        const bIndex = featuredProductIdMap.get(b.id) ?? Infinity
        return aIndex - bIndex
      })
    : featuredProducts

  return {
    categories,
    featuredProducts: sortedFeaturedProducts,
    newArrivals,
    stats,
    reviews: reviewsCount,
    customerReviews,
  }
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

  // Get category data for promo cards
  const shishaCategory = categories.find(c => c.name.toLowerCase().includes('shisha') || c.name.toLowerCase().includes('hookah'))
  const vapeCategory = categories.find(c => c.name.toLowerCase().includes('vape'))
  const accessoriesCategory = categories.find(c => c.name.toLowerCase().includes('accessor'))

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Banner - Free Delivery */}
      <div className="bg-blue-600 text-white py-2 text-center text-sm font-semibold">
        <p>FREE DELIVERY ON ALL ORDERS OVER KES 2,000</p>
      </div>

      {/* Hero Section - Promotional Banner */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Premium Shisha & Vapes
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-200">
              Mix & Match any flavor & strength. Best prices in Mombasa
            </p>
            <Link
              href="/products"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      {primaryFlashSale && primaryFlashSale.products.length > 0 && (
        <section className="py-8 md:py-10 bg-gradient-to-r from-red-900 via-purple-900 to-gray-900 border-y border-red-700/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/40 flex-shrink-0">
                  <Zap className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {primaryFlashSale.title || 'Flash Sale'}
                  </h2>
                  <p className="text-red-300 font-semibold text-sm md:text-base">
                    Up to {primaryFlashSale.discountPercent}% OFF • Limited Time Only
                  </p>
                  {primaryFlashSale.description && (
                    <p className="text-gray-200 mt-2 max-w-xl text-sm md:text-base">
                      {primaryFlashSale.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <CountdownTimer endDate={primaryFlashSale.endDate} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* Category Introduction - 3 Columns */}
      <section className="py-12 md:py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 text-center">
            Mombasa Shisha Bongs - Online Vape Shop
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Shisha Column */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1761839257287-3030c9300ece?w=800&h=600&fit=crop&q=80"
                  alt="Shisha Products"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Shisha & Hookah</h3>
              <p className="text-gray-300 text-sm mb-4">
                Premium shisha pipes, hookah accessories, flavored tobacco, and everything you need for the perfect shisha experience.
              </p>
              <Link
                href={shishaCategory ? `/categories/${shishaCategory.id}` : '/products'}
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors inline-flex items-center gap-2"
              >
                Shop Now <span>→</span>
              </Link>
            </div>

            {/* Vape Kits Column */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1555697863-80a30c6e4bc1?w=800&h=600&fit=crop&q=80"
                  alt="Vape Kits"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Vape Kits</h3>
              <p className="text-gray-300 text-sm mb-4">
                Starter kits, pod kits, sub-ohm kits, and advanced vape kits. Everything from beginner to expert level.
              </p>
              <Link
                href={vapeCategory ? `/categories/${vapeCategory.id}` : '/products'}
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors inline-flex items-center gap-2"
              >
                Shop Now <span>→</span>
              </Link>
            </div>

            {/* Disposables Column */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80"
                  alt="Disposables"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Disposables & E-Liquids</h3>
              <p className="text-gray-300 text-sm mb-4">
                Convenient disposable vapes, premium e-liquids, nicotine salts, and a wide variety of flavors to choose from.
              </p>
              <Link
                href="/products"
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors inline-flex items-center gap-2"
              >
                Shop Now <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 md:py-16 bg-gray-800 border-y border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              Your trusted source for all vaping needs
            </h2>
            <p className="text-gray-300 text-center leading-relaxed text-sm md:text-base">
              At Mombasa Shisha Bongs, we are committed to providing you with the highest quality shisha products, vape kits, and accessories. 
              As a leading online vape shop in Kenya, we offer the best vape kits, e-liquids, and accessories at competitive prices. 
              Our team is dedicated to ensuring you have the best shopping experience with fast delivery, secure payments, and excellent customer service.
            </p>
          </div>
        </div>
      </section>

      {/* Category Promotional Cards */}
      <section className="py-12 md:py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 5).map((category, index) => {
              const getCategoryImage = (name: string) => {
                const nameLower = name.toLowerCase()
                if (nameLower.includes('shisha') || nameLower.includes('hookah')) {
                  return 'https://images.unsplash.com/photo-1761839257287-3030c9300ece?w=800&h=600&fit=crop&q=80'
                }
                if (nameLower.includes('vape')) {
                  return 'https://images.unsplash.com/photo-1555697863-80a30c6e4bc1?w=800&h=600&fit=crop&q=80'
                }
                if (nameLower.includes('accessor')) {
                  return 'https://images.unsplash.com/photo-1591522810163-d1e3cbf1c888?w=800&h=600&fit=crop&q=80'
                }
                return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80'
              }

              return (
                <CategoryPromoCard
                  key={category.id}
                  title={category.name}
                  description={`Premium ${category.name.toLowerCase()} products`}
                  products={`Browse our ${category.name.toLowerCase()} collection`}
                  priceRange="KES 500"
                  image={category.image || getCategoryImage(category.name)}
                  href={`/categories/${category.id}`}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      {serializedFeatured.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                    Trending Vape Products
                  </h2>
                  <p className="text-gray-400 text-sm md:text-base">Most popular products right now</p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-2 text-sm md:text-base"
              >
                View All <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {serializedFeatured.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Logos Section */}
      <section className="py-8 md:py-12 bg-gray-800 border-y border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            <div className="text-2xl md:text-3xl font-bold text-white">SHIVA</div>
            <div className="text-2xl md:text-3xl font-bold text-white">HAWAII</div>
            <div className="text-2xl md:text-3xl font-bold text-white">187</div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Customer Reviews Section */}
      {customerReviews.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                    Latest Customer Reviews
                  </h2>
                  <p className="text-gray-400 text-sm md:text-base">See what our customers are saying</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-gray-300 font-semibold ml-2 text-sm md:text-base">
                  {reviews}+ Reviews
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {customerReviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Expert Tips Section */}
      <ExpertTips />

      {/* FAQs Section */}
      <FAQ />

      {/* Recently Viewed Section */}
      <RecentlyViewed />
    </div>
  )
}
