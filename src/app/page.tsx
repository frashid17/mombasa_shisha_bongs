import Link from 'next/link'
import { Metadata } from 'next'
import prisma, { withRetry } from '@/lib/prisma'
import { Shield, Star, TrendingUp, Truck, Sparkles, Zap, Award, MessageSquare, Package, ShoppingBag } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/home/ProductCard'
import AnimatedSection from '@/components/home/AnimatedSection'
import ReviewCard from '@/components/home/ReviewCard'
import RecentlyViewed from '@/components/home/RecentlyViewed'
import FAQ from '@/components/home/FAQ'
import ExpertTips from '@/components/home/ExpertTips'
import BundlesSection from '@/components/home/BundlesSection'
import { serializeProducts } from '@/lib/prisma-serialize'
import CategoryImage from '@/components/categories/CategoryImage'
import CountdownTimer from '@/components/flash-sales/CountdownTimer'
import Image from 'next/image'
import StructuredData from '@/components/seo/StructuredData'
import PriceDisplay from '@/components/products/PriceDisplay'
import AnimatedIcon from '@/components/home/AnimatedIcon'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

// Cache homepage data for 1 hour for better LCP - homepage rarely changes
// ISR will regenerate in background when cache expires
export const revalidate = 3600 // 1 hour

// Optimize metadata generation
export async function generateMetadata(): Promise<Metadata> {
  return {
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
}

async function getFeaturedData() {
  // Calculate date for "new arrivals" (products created in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get top-selling products for "featured" (based on order items)
  const topSellingProducts = await withRetry(() => prisma.orderItem.groupBy({
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
  }))

  const featuredProductIds = topSellingProducts.map((item) => item.productId)
  const featuredProductIdMap = new Map(
    topSellingProducts.map((item, index) => [item.productId, index])
  )

  // Optimized: Reduced queries and data fetching for better LCP
  const [categories, featuredProducts, newArrivals, stats, reviewsCount, customerReviews, allProducts] = await Promise.all([
    withRetry(() => prisma.category.findMany({ 
      where: { isActive: true }, 
      orderBy: { name: 'asc' },
      take: 8 // Limit categories
    })),
    // Featured products: Top-selling products (optimized includes)
    withRetry(() => featuredProductIds.length > 0
      ? prisma.product.findMany({
          where: {
            isActive: true,
            id: { in: featuredProductIds },
          },
          include: {
            images: { take: 1, select: { url: true, altText: true } },
            category: { select: { name: true, slug: true } },
            specifications: {
              where: { isActive: true },
              select: { id: true },
              take: 1, // Just check if has specs
            },
          },
          take: 6, // Reduced from 8
        })
      : // Fallback: If no sales yet, show recently created products
        prisma.product.findMany({
          where: { isActive: true },
          include: { 
            images: { take: 1, select: { url: true, altText: true } }, 
            category: { select: { name: true, slug: true } },
            specifications: {
              where: { isActive: true },
              select: { id: true },
              take: 1,
            },
          },
          take: 6,
          orderBy: { createdAt: 'desc' },
        })),
    // New arrivals: Reduced data
    withRetry(() => prisma.product.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        images: { take: 1, select: { url: true, altText: true } },
        category: { select: { name: true, slug: true } },
      },
      take: 6, // Reduced from 8
      orderBy: { createdAt: 'desc' },
    })),
    withRetry(() => prisma.product.count({ where: { isActive: true } })),
    withRetry(() => prisma.review.count()),
    withRetry(() => prisma.review.findMany({
      where: { isApproved: true },
      select: {
        id: true,
        rating: true,
        comment: true,
        title: true,
        userName: true,
        createdAt: true,
        product: {
          select: {
            name: true,
            images: { take: 1, select: { url: true } },
          },
        },
      },
      take: 5, // Reduced from 6
      orderBy: { createdAt: 'desc' },
    })),
    // Explore All: Reduced significantly
    withRetry(() => prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { take: 1, select: { url: true, altText: true } },
        category: { select: { name: true, slug: true } },
        specifications: {
          where: { isActive: true },
          select: { id: true },
          take: 1,
        },
      },
      take: 8, // Reduced from 12
      orderBy: { createdAt: 'desc' },
    })),
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

async function getActiveBundles() {
  const bundles = await withRetry(() =>
    prisma.productBundle.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
                colors: { where: { isActive: true } },
                specifications: { where: { isActive: true } },
              },
            },
            color: true,
            specification: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
  )

  // Serialize Decimal values to numbers
  return bundles.map((bundle) => ({
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    image: bundle.image,
    price: Number(bundle.price),
    discount: bundle.discount ? Number(bundle.discount) : null,
    items: bundle.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      colorId: item.colorId,
      specId: item.specId,
      allowColorSelection: item.allowColorSelection,
      allowSpecSelection: item.allowSpecSelection,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        image: item.product.images[0]?.url || item.product.featuredImage,
        slug: item.product.slug,
        colors: item.product.colors.map((c) => ({
          id: c.id,
          name: c.name,
          value: c.value,
        })),
        specifications: item.product.specifications.map((s) => ({
          id: s.id,
          type: s.type,
          name: s.name,
          value: s.value,
          price: s.price ? Number(s.price) : null,
        })),
      },
      preselectedColor: item.color,
      preselectedSpec: item.specification,
    })),
  }))
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
  const activeBundles = await getActiveBundles()

  return (
    <>
      <StructuredData type="Organization" />
      <div className="min-h-screen animated-gradient-bg">
        {/* Hero Section - Promotional Banner */}
        <section className="py-12 md:py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Hero Text */}
              <div className="text-center mb-10 md:mb-14">
                <h1 
                  className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight"
                  style={{ contentVisibility: 'auto' }}
                >
                  Premium Shisha & Vapes
                </h1>
                <p className="text-lg md:text-xl mb-6 text-gray-600 max-w-2xl mx-auto">
                  Mix & match any flavor & strength. Fast delivery, secure payment, and authentic products in Mombasa.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center bg-red-600 text-white font-bold px-8 py-3 rounded-md text-base md:text-lg transition-all duration-300 hover:bg-red-700 shadow-md hover:shadow-lg"
                  >
                    Shop Now
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center border-2 border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 px-6 py-4 rounded-md text-sm md:text-base bg-white hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Browse All Products
                  </Link>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-8">
                <Link href="#explore-all-items" className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2 hover:shadow-md hover:border-red-500 transition-all duration-300 cursor-pointer">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <AnimatedIcon animationType="pulse">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </AnimatedIcon>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Products</p>
                    <p className="text-gray-900 font-bold text-base">
                      {stats}+
                      <span className="ml-1 text-xs font-medium text-gray-600">items in stock</span>
                    </p>
                  </div>
                </Link>
                <Link href="#customer-reviews" className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2 hover:shadow-md hover:border-red-500 transition-all duration-300 cursor-pointer">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <AnimatedIcon animationType="pulse">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </AnimatedIcon>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Customer Reviews</p>
                    <p className="text-gray-900 font-bold text-base">
                      {reviews}+
                      <span className="ml-1 text-xs font-medium text-gray-600">verified ratings</span>
                    </p>
                  </div>
                </Link>
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2.5 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-red-600 p-2 rounded-lg">
                      <AnimatedIcon animationType="bounce">
                        <Truck className="w-5 h-5 text-white" />
                      </AnimatedIcon>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Delivery</p>
                      <p className="text-gray-900 font-bold text-base">
                        Same-day
                        <span className="ml-1 text-xs font-medium text-gray-600">within Mombasa</span>
                      </p>
                      <p className="text-red-600 font-semibold text-xs mt-0.5">
                        ✨ Pay on Delivery Available ✨
                      </p>
                    </div>
                  </div>
                  {/* M-Pesa Trust Badges */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <div className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                        M-PESA
                      </div>
                      <span className="text-[10px] text-gray-600 font-medium">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px]">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured product strip inside hero - Modern & Prominent */}
              {serializedFeatured.length > 0 && (
                <div className="mt-12 md:mt-16">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-lg shadow-red-500/30">
                        <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                          Popular Right Now
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 font-medium">
                          Trending products everyone's buying
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/products"
                      className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 md:px-6 md:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm md:text-base whitespace-nowrap"
                    >
                      <span>View All Products</span>
                      <span className="text-lg md:text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </Link>
                  </div>
                  <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pt-2 pb-4 -mx-4 px-4 snap-x snap-mandatory">
                    {serializedFeatured.slice(0, 10).map((product, index) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="min-w-[220px] md:min-w-[260px] bg-white/98 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-4 md:p-5 flex-shrink-0 snap-start hover:border-red-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg group"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <div className="relative h-40 md:h-48 w-full rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-300">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].altText || product.name}
                              fill
                              className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                              No image
                            </div>
                          )}
                          {/* Badge overlay */}
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                            HOT
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-red-600 mb-1 line-clamp-1 font-bold uppercase tracking-wide">
                            {product.category?.name || 'Shisha & Vapes'}
                          </p>
                          <p className="text-sm md:text-base text-gray-900 font-bold mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                            {product.name}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-lg md:text-xl text-gray-900 font-bold">
                              KES {Number(product.price).toLocaleString()}
                            </p>
                            <div className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs font-semibold">
                              Shop Now
                            </div>
                          </div>
                        </div>
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
        <section className="py-8 md:py-10 bg-red-600 border-y border-red-700">
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
      <section className="py-12 md:py-16 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Your trusted source for all vaping needs
            </h2>
            <p className="text-gray-700 text-center leading-relaxed text-base md:text-lg">
              At Mombasa Shisha Bongs, we are committed to providing you with the highest quality shisha products, vape kits, and accessories. 
              As a leading online vape shop in Kenya, we offer the best vape kits, e-liquids, and accessories at competitive prices. 
              Our team is dedicated to ensuring you have the best shopping experience with fast delivery, secure payments, and excellent customer service.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Shop by Category</h2>
              <p className="text-gray-600 font-medium">Browse our wide selection of premium products</p>
            </div>
            <Link
              href="/categories"
              className="text-red-600 font-bold hover:text-red-700 transition-colors flex items-center gap-2 hover:scale-110 transform duration-300"
            >
              View All <span className="text-xl">→</span>
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
                  className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:border-red-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-48 md:h-56 bg-gray-50 overflow-hidden">
                    <CategoryImage
                      src={category.image || getCategoryImage(category.name)}
                      alt={category.name}
                      className={`object-cover group-hover:scale-110 transition-transform duration-500 ${!category.image ? 'opacity-80' : ''}`}
                      unoptimized={category.image ? (category.image.startsWith('http') && !category.image.includes('localhost')) : true}
                    />
                  </div>
                  <div className="p-4 text-center relative z-10 bg-white">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-all duration-300 line-clamp-2">{category.name}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Explore All Items Section */}
      {serializedAllProducts.length > 0 && (
        <section id="explore-all-items" className="py-12 md:py-16 bg-white/80 backdrop-blur-sm border-t border-gray-200 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-green-600 mb-1 md:mb-2">
                    Explore All Items
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base font-medium">Browse our complete product catalog</p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-blue-600 font-bold hover:text-cyan-600 transition-colors flex items-center gap-2 text-sm md:text-base hover:scale-110 transform duration-300"
              >
                View All Products <span className="text-xl">→</span>
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

      {/* Bundles Section */}
      {activeBundles.length > 0 && (
        <BundlesSection bundles={activeBundles} />
      )}

      {/* Expert Tips Section */}
      <ExpertTips />

      {/* Customer Reviews Section */}
      {customerReviews.length > 0 && (
        <section id="customer-reviews" className="py-12 md:py-16 bg-white/80 backdrop-blur-sm border-t border-gray-200 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-red-600 mb-1 md:mb-2">
                    Latest Customer Reviews
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base font-medium">See what our customers are saying</p>
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
                <span className="text-gray-600 font-semibold ml-2 text-sm md:text-base">
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

      {/* FAQs Section */}
      <FAQ />

      {/* Recently Viewed Section */}
      <RecentlyViewed />
    </div>
    </>
  )
}
