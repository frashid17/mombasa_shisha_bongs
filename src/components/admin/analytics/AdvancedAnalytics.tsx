'use client'

import Image from 'next/image'
import { TrendingUp, Package, Users } from 'lucide-react'
import { useState } from 'react'

interface RevenueByMonth {
  month: string
  revenue: number
}

interface TopProduct {
  productId: string
  _sum: {
    quantity: number
    price: number
  }
  _count: {
    productId: number
  }
  product: {
    id: string
    name: string
    featuredImage: string | null
    price: number
  } | null
}

interface AdvancedAnalyticsProps {
  revenueByMonth: RevenueByMonth[]
  topProducts: TopProduct[]
  totalCustomers: number
}

export default function AdvancedAnalytics({
  revenueByMonth,
  topProducts,
  totalCustomers,
}: AdvancedAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m'>('6m')

  const maxRevenue = Math.max(...revenueByMonth.map((d) => Number(d.revenue)), 1)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Revenue Trends</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Last 6 months</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('6m')}
              className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-medium ${
                selectedPeriod === '6m'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setSelectedPeriod('12m')}
              className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-medium ${
                selectedPeriod === '12m'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              12M
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 sm:h-56 md:h-64 mt-4 sm:mt-6">
          {revenueByMonth.map((item) => {
            const revenue = Number(item.revenue)
            const height = (revenue / maxRevenue) * 100
            const monthName = new Date(item.month + '-01').toLocaleDateString('en-US', {
              month: 'short',
            })

            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ minHeight: '20px' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-red-600 rounded-t-lg transition-all duration-300"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-gray-600">{monthName}</span>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  KES {(revenue / 1000).toFixed(0)}k
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
            <span className="text-gray-600">Total Revenue (6 months)</span>
            <span className="font-semibold text-gray-900">
              KES{' '}
              {revenueByMonth
                .reduce((sum, item) => sum + Number(item.revenue), 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Top Selling Products</h2>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sales data yet</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {topProducts.map((item, index) => {
              if (!item.product) return null

              const totalRevenue = Number(item._sum.price || 0)
              const totalQuantity = Number(item._sum.quantity || 0)
              const orderCount = item._count.productId

              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
                >
                  {/* Rank Badge - Mobile Optimized */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs sm:text-sm md:text-lg font-bold text-gray-600">
                      #{index + 1}
                    </div>
                  </div>
                  
                  {/* Product Image - Mobile Optimized */}
                  {item.product.featuredImage ? (
                    <div className="flex-shrink-0">
                      <Image
                        src={item.product.featuredImage}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Product Info - Mobile Optimized */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{item.product.name}</h3>
                    <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-600">
                      <span>{totalQuantity} sold</span>
                      <span className="text-gray-400">•</span>
                      <span>{orderCount} orders</span>
                    </div>
                  </div>
                  
                  {/* Revenue - Mobile Optimized */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-sm sm:text-base text-gray-900">
                      KES {totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">Revenue</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Base</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600">Active Customers</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                {totalCustomers} <span className="text-xs sm:text-sm font-normal text-gray-500">(100%)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Product Performance</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Best Seller</p>
              {topProducts[0]?.product ? (
                <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1 truncate">
                  {topProducts[0].product.name}
                </p>
              ) : (
                <p className="text-base sm:text-lg font-semibold text-gray-400 mt-1">No data</p>
              )}
            </div>
            <div className="pt-3 sm:pt-4 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600">Total Products Sold</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                {topProducts.reduce((sum, item) => sum + Number(item._sum.quantity || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

