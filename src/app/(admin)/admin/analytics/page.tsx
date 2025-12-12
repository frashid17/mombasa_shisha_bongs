import prisma from '@/lib/prisma'
import RevenueChart from '@/components/admin/dashboard/RevenueChart'

async function getAnalytics() {
  const [totalRevenue, totalOrders, totalProducts, totalCustomers] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.groupBy({
      by: ['userId'],
      _count: { userId: true },
    }),
  ])

  return {
    totalRevenue: totalRevenue._sum.total || 0,
    totalOrders,
    totalProducts,
    totalCustomers: totalCustomers.length,
  }
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-700 mt-1">View detailed analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">KES {analytics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Active Products</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Total Customers</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalCustomers}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Over Time</h2>
        <RevenueChart />
      </div>
    </div>
  )
}

