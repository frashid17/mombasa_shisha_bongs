import prisma, { withRetry } from '@/lib/prisma'
import RevenueChart from '@/components/admin/dashboard/RevenueChart'
import AdvancedAnalytics from '@/components/admin/analytics/AdvancedAnalytics'

async function getAnalytics() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    revenueLast30Days,
    revenuePrevious30Days,
    ordersLast30Days,
    ordersPrevious30Days,
    averageOrderValue,
    topProducts,
    revenueByMonth,
  ] = await Promise.all([
    // Total revenue (all time)
    withRetry(() =>
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      })
    ),
    // Total orders
    withRetry(() => prisma.order.count()),
    // Active products
    withRetry(() => prisma.product.count({ where: { isActive: true } })),
    // Total customers
    withRetry(() =>
      prisma.order.groupBy({
        by: ['userId'],
        _count: { userId: true },
      })
    ),
    // Revenue last 30 days
    withRetry(() =>
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { total: true },
      })
    ),
    // Revenue previous 30 days
    withRetry(() =>
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { total: true },
      })
    ),
    // Orders last 30 days
    withRetry(() =>
      prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      })
    ),
    // Orders previous 30 days
    withRetry(() =>
      prisma.order.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      })
    ),
    // Average order value
    withRetry(() =>
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _avg: { total: true },
      })
    ),
    // Top products
    withRetry(() =>
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        _count: { productId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      })
    ),
    // Revenue by month (last 6 months)
    withRetry(() =>
      prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          COALESCE(SUM(total), 0)::decimal as revenue
        FROM orders
        WHERE "paymentStatus" = 'PAID'
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 6
      `
    ),
  ])

  // Get product details for top products
  const productIds = topProducts.map((p) => p.productId)
  const products = await withRetry(() =>
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        featuredImage: true,
        price: true,
      },
    })
  )

  const topProductsWithDetails = topProducts.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    // Handle Prisma Decimal types and null values
    const quantity = item._sum.quantity ?? 0
    const price = item._sum.price ? Number(item._sum.price) : 0
    const count = item._count.productId ?? 0
    
    return {
      productId: item.productId,
      _sum: {
        quantity,
        price,
      },
      _count: {
        productId: count,
      },
      product: product ? {
        id: product.id,
        name: product.name,
        featuredImage: product.featuredImage,
        price: Number(product.price),
      } : null,
    }
  })

  const totalRevenueValue = Number(totalRevenue._sum.total || 0)
  const revenueLast30 = Number(revenueLast30Days._sum.total || 0)
  const revenuePrevious30 = Number(revenuePrevious30Days._sum.total || 0)
  const revenueGrowth =
    revenuePrevious30 > 0
      ? ((revenueLast30 - revenuePrevious30) / revenuePrevious30) * 100
      : 0

  const ordersGrowth =
    ordersPrevious30Days > 0
      ? ((ordersLast30Days - ordersPrevious30Days) / ordersPrevious30Days) * 100
      : 0

  // Convert revenueByMonth Decimal values to numbers
  const revenueByMonthSerialized = revenueByMonth.map((item) => ({
    month: item.month,
    revenue: Number(item.revenue),
  }))

  return {
    totalRevenue: totalRevenueValue,
    totalOrders,
    totalProducts,
    totalCustomers: totalCustomers.length,
    revenueLast30Days: revenueLast30,
    revenueGrowth,
    ordersLast30Days,
    ordersGrowth,
    averageOrderValue: Number(averageOrderValue._avg.total || 0),
    topProducts: topProductsWithDetails,
    revenueByMonth: revenueByMonthSerialized.reverse(),
  }
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-sm sm:text-base text-gray-700 mt-1">Comprehensive insights into your business performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 md:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Total Revenue</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            KES {analytics.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Last 30 days: KES {analytics.revenueLast30Days.toLocaleString()}
          </p>
          {analytics.revenueGrowth !== 0 && (
            <p
              className={`text-xs sm:text-sm mt-1 font-semibold ${
                analytics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {analytics.revenueGrowth > 0 ? '↑' : '↓'}{' '}
              {Math.abs(analytics.revenueGrowth).toFixed(1)}% vs previous period
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 md:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Total Orders</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Last 30 days: {analytics.ordersLast30Days}
          </p>
          {analytics.ordersGrowth !== 0 && (
            <p
              className={`text-xs sm:text-sm mt-1 font-semibold ${
                analytics.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {analytics.ordersGrowth > 0 ? '↑' : '↓'}{' '}
              {Math.abs(analytics.ordersGrowth).toFixed(1)}% vs previous period
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 md:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Average Order Value</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            KES {analytics.averageOrderValue.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Per order</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 md:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Active Products</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Currently available</p>
        </div>
      </div>

      {/* Advanced Analytics Component */}
      <AdvancedAnalytics
        revenueByMonth={analytics.revenueByMonth}
        topProducts={analytics.topProducts}
        totalCustomers={analytics.totalCustomers}
      />
    </div>
  )
}

