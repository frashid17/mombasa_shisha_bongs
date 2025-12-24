import prisma from '@/lib/prisma'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

export default async function StatsCards() {
  // Fetch statistics with error handling
  let totalRevenue = { _sum: { total: null } }
  let totalOrders = 0
  let totalProducts = 0
  let totalCustomers: { userId: string }[] = []
  let previousMonthRevenue = { _sum: { total: null } }
  let previousMonthOrders = 0

  try {
    const results = await Promise.all([
      // Total Revenue (paid orders)
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }).catch(() => ({ _sum: { total: null } })),
      // Total Orders
      prisma.order.count().catch(() => 0),
      // Total Products
      prisma.product.count({ where: { isActive: true } }).catch(() => 0),
      // Total Customers (unique userIds)
      prisma.order.findMany({ select: { userId: true }, distinct: ['userId'] }).catch(() => []),
      // Previous Month Revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            lt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
        _sum: { total: true },
      }).catch(() => ({ _sum: { total: null } })),
      // Previous Month Orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            lt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      }).catch(() => 0),
    ])

    totalRevenue = results[0] as typeof totalRevenue
    totalOrders = results[1] as number
    totalProducts = results[2] as number
    totalCustomers = results[3] as typeof totalCustomers
    previousMonthRevenue = results[4] as typeof previousMonthRevenue
    previousMonthOrders = results[5] as number
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error)
    // Use default values on error
  }

  const revenue = Number(totalRevenue._sum.total || 0)
  const prevRevenue = Number(previousMonthRevenue._sum.total || 0)
  const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0

  const ordersChange =
    previousMonthOrders > 0 ? ((totalOrders - previousMonthOrders) / previousMonthOrders) * 100 : 0

  const stats = [
    {
      name: 'Total Revenue',
      value: `KSH ${revenue.toLocaleString()}`,
      change: revenueChange,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Total Orders',
      value: totalOrders.toString(),
      change: ordersChange,
      icon: ShoppingCart,
      color: 'text-red-600 bg-red-100',
    },
    {
      name: 'Products',
      value: totalProducts.toString(),
      change: null,
      icon: Package,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      name: 'Customers',
      value: totalCustomers.length.toString(),
      change: null,
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isPositive = stat.change !== null && stat.change >= 0
        const ChangeIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <div
            key={stat.name}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.change !== null && (
                  <div className="mt-2 flex items-center gap-1">
                    <ChangeIcon
                      className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

