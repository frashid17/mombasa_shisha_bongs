import Link from 'next/link'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { Shield, Star, TrendingUp, Truck, Sparkles, Zap, Award, MessageSquare, Package, ShoppingBag } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/home/ProductCard'
import AnimatedSection from '@/components/home/AnimatedSection'
import ReviewCard from '@/components/home/ReviewCard'
import RecentlyViewed from '@/components/home/RecentlyViewed'
import FAQ from '@/components/home/FAQ'
import ExpertTips from '@/components/home/ExpertTips'
import { serializeProducts } from '@/lib/prisma-serialize'
import CategoryImage from '@/components/categories/CategoryImage'
import CountdownTimer from '@/components/flash-sales/CountdownTimer'
import Image from 'next/image'
import StructuredData from '@/components/seo/StructuredData'
import PriceDisplay from '@/components/products/PriceDisplay'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

// Cache homepage data for 5 minutes to avoid recomputing heavy Prisma queries on every request
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Premium Shisha & Vapes in Mombasa, Kenya',
  description: 'Shop premium shisha, hookahs, vapes, and smoking accessories in Mombasa. Fast delivery, authentic products, secure payment. Browse our collection of shisha flavors, disposable vapes, e-liquids, and hookah accessories.',
  openGraph: {
    title: 'Mombasa Shisha Bongs - Premium Shisha & Vapes',
    description: 'Premium shisha, vapes, and smoking accessories in Mombasa, Kenya. Fast delivery, authentic products.',
    url: siteUrl,
    images: ['/logo.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
}

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

  const [categories, featuredProducts, newArrivals, stats, reviewsCount, customerReviews, allProducts] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
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
      include: {
        images: { take: 1 },
        category: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
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
    // Get all products for "Explore All Items" section
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { take: 1 },
        category: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      take: 12,
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
    allProducts,
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
  const { categories, featuredProducts, newArrivals, stats, reviews, customerReviews, allProducts } = await getFeaturedData()
  // Compute rating meta for homepage cards (keep heavy review UI in product pages)
  const mapWithRating = (products: any[]) =>
    products.map((p) => {
      const ratings: number[] = p.reviews?.map((r: { rating: number }) => r.rating) ?? []
      const reviewCount = ratings.length
      const averageRating =
        reviewCount > 0
          ? ratings.reduce((sum: number, r: number) => sum + r, 0) / reviewCount
          : undefined
      return {
        ...p,
        averageRating,
        reviewCount,
      }
    })

  const serializedFeatured = serializeProducts(mapWithRating(featuredProducts))
  const serializedNewArrivals = serializeProducts(mapWithRating(newArrivals))
  const serializedAllProducts = serializeProducts(mapWithRating(allProducts))
  const activeFlashSales = await getActiveFlashSales()
  const primaryFlashSale = activeFlashSales[0]

  return (
    <>
      <StructuredData type="Organization" />
      <div className="min-h-screen bg-gray-900 page-fade-in">
        {/* Top Banner - Pay on Delivery */}
        <div className="bg-blue-600 text-white py-2 text-center text-sm font-semibold">
          <p>PAY ON DELIVERY IN MOMBASA</p>
        </div>

        {/* Hero Section - Promotional Banner */}
        <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white py-12 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Hero Text */}
              <div className="text-center mb-10 md:mb-14 animate-fade-in-up">
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs md:text-sm text-gray-200 border border-white/20 mb-4">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Trusted Shisha & Vape store in Mombasa</span>
                </p>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight md:leading-[1.1]">
                  Premium Shisha & Vapes
          </h1>
                <p className="text-lg md:text-2xl mb-6 text-gray-200 max-w-2xl mx-auto">
                  Mix & match any flavor & strength. Fast delivery, secure payment, and authentic products in Mombasa.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg text-base md:text-lg transition-colors shadow-lg shadow-yellow-500/30"
                  >
                    Shop Now
                  </Link>
                  <Link
                    href="#trending"
                    className="inline-flex items-center justify-center border border-white/30 hover:border-white/60 text-white px-6 py-3 rounded-lg text-sm md:text-base bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Browse Trending Products
                  </Link>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-6 text-sm md:text-base animate-fade-in-up-delay">
                <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Products</p>
                    <p className="text-white font-semibold text-lg">
                      {stats}+
                      <span className="ml-1 text-xs font-normal text-gray-300">items in stock</span>
                    </p>
                  </div>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Customer Reviews</p>
                    <p className="text-white font-semibold text-lg">
                      {reviews}+
                      <span className="ml-1 text-xs font-normal text-gray-300">verified ratings</span>
                    </p>
                  </div>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur">
                  <Truck className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Delivery</p>
                    <p className="text-white font-semibold text-lg">
                      Same-day
                      <span className="ml-1 text-xs font-normal text-gray-300">within Mombasa</span>
          </p>
        </div>
                </div>
              </div>

              {/* Featured product strip inside hero */}
              {serializedFeatured.length > 0 && (
                <div className="mt-10 md:mt-12">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-yellow-300" />
                      <span>Popular right now</span>
                    </p>
                    <Link
                      href="/products"
                      className="text-xs md:text-sm text-blue-300 hover:text-blue-200 transition-colors"
                    >
                      View all products →
                    </Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pt-1 pb-3 -mx-4 px-4 snap-x snap-mandatory">
                    {serializedFeatured.slice(0, 10).map((product, index) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="min-w-[180px] max-w-[200px] bg-black/30 border border-white/10 rounded-xl p-3 flex-shrink-0 snap-start hover:border-blue-400/60 hover:bg-black/40 transition-colors"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <div className="relative h-28 w-full rounded-lg overflow-hidden mb-3 bg-gray-800">
                          {product.images?.[0]?.url ? (
            <Image
                              src={product.images[0].url}
                              alt={product.images[0].altText || product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              No image
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-blue-300 mb-1 line-clamp-1">
                          {product.category?.name || 'Shisha & Vapes'}
                        </p>
                        <p className="text-sm text-white font-semibold mb-1 line-clamp-2">
                          {product.name}
                        </p>
                        <PriceDisplay price={product.price} size="sm" showCompare={false} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
                  category: product.category || { name: 'Uncategorized' },
                }

                return (
                  <ProductCard key={product.id} product={productForCard} index={index} />
                )
              })}
            </div>
          </div>
        </section>
      )}

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

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Shop by Category</h2>
              <p className="text-gray-400">Browse our wide selection of premium products</p>
            </div>
            <Link
              href="/categories"
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              View All <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => {
              const getCategoryImage = (name: string) => {
                const nameLower = name.toLowerCase()
                if (nameLower.includes('shisha') && nameLower.includes('flavor')) {
                  return 'https://images.unsplash.com/photo-1548595165-c96277dfa6d3?w=800&h=600&fit=crop&q=80'
                }
                if (nameLower.includes('disposable')) {
                  return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80'
                }
                if (nameLower.includes('shisha') || nameLower.includes('hookah')) {
                  return 'https://images.unsplash.com/photo-1761839257287-3030c9300ece?w=800&h=600&fit=crop&q=80'
                }
                if (nameLower.includes('accessor')) {
                  return 'https://images.unsplash.com/photo-1591522810163-d1e3cbf1c888?w=800&h=600&fit=crop&q=80'
                }
                if (nameLower.includes('coal')) {
                  return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80'
                }
                if (nameLower.includes('refillable')) {
                  return 'https://images.unsplash.com/photo-1555697863-80a30c6e4bc1?w=800&h=600&fit=crop&q=80'
                }
                if (nameLower.includes('liquid')) {
                  return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80'
                }
                return 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80'
              }

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all hover:scale-105 group relative"
                >
                  <div className="relative h-48 md:h-56 bg-gray-800 overflow-hidden">
                    <CategoryImage
                      src={category.image || getCategoryImage(category.name)}
                      alt={category.name}
                      className={`object-cover group-hover:scale-110 transition-transform duration-500 ${!category.image ? 'opacity-80' : ''}`}
                      unoptimized={category.image ? (category.image.startsWith('http') && !category.image.includes('localhost')) : true}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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

      {/* Trending Products Section */}
      {serializedFeatured.length > 0 && (
        <section
          id="trending"
          className="py-12 md:py-16 bg-gray-900 border-t border-gray-800"
        >
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

      {/* Explore All Items Section */}
      {serializedAllProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                    Explore All Items
                  </h2>
                  <p className="text-gray-400 text-sm md:text-base">Browse our complete product catalog</p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-2 text-sm md:text-base"
              >
                View All Products <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {serializedAllProducts.slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

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
    </>
  )
}
