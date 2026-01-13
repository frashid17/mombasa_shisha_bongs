'use client'

import Image from 'next/image'
import { TrendingUp, Package, Users, TrendingDown, Award, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'

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
    images: Array<{ url: string }>
  } | null
}

interface AdvancedAnalyticsProps {
  revenueByMonth: RevenueByMonth[]
  topProducts: TopProduct[]
  totalCustomers: number
}

export default function AdvancedAnalytics({
  revenueByMonth: initialRevenue,
  topProducts,
  totalCustomers,
}: AdvancedAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<6 | 12>(6)
  const [revenueByMonth, setRevenueByMonth] = useState(initialRevenue)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/analytics/revenue?months=${selectedPeriod}`)
        const data = await response.json()
        if (data.success) {
          setRevenueByMonth(data.data)
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [selectedPeriod])

  const maxRevenue = Math.max(...revenueByMonth.map((d) => Number(d.revenue)), 1)
  
  // Calculate Y-axis labels (5 evenly spaced values)
  const getYAxisLabels = () => {
    const labels = []
    for (let i = 5; i >= 0; i--) {
      labels.push((maxRevenue / 5) * i)
    }
    return labels
  }
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toFixed(0)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Revenue Chart */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Revenue Trends</h2>
            </div>
            <p className="text-sm text-gray-600">Last {selectedPeriod} months performance</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod(6)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedPeriod === 6
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              } disabled:opacity-50`}
            >
              6 Months
            </button>
            <button
              onClick={() => setSelectedPeriod(12)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedPeriod === 12
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              } disabled:opacity-50`}
            >
              12 Months
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <div className="relative bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex gap-4">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between h-72 py-2">
                  {getYAxisLabels().map((value, index) => (
                    <div key={index} className="text-xs font-medium text-gray-600 text-right">
                      KES {formatCurrency(value)}
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="flex-1 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {getYAxisLabels().map((_, index) => (
                      <div key={index} className="border-t border-gray-200"></div>
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="relative flex items-end justify-between gap-2 h-72">
                    {revenueByMonth.map((item) => {
                      const revenue = Number(item.revenue)
                      const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
                      const monthName = new Date(item.month + '-01').toLocaleDateString('en-US', {
                        month: 'short',
                      })
                      const year = new Date(item.month + '-01').getFullYear()

                      return (
                        <div key={item.month} className="flex-1 flex flex-col items-center group h-full justify-end">
                          {/* Tooltip */}
                          <div className="absolute -top-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            <div className="font-bold">KES {revenue.toLocaleString()}</div>
                            <div className="text-gray-300">{monthName} {year}</div>
                          </div>
                          
                          {/* Bar */}
                          <div 
                            className="w-full bg-gradient-to-t from-red-600 via-red-500 to-red-400 rounded-t-lg transition-all duration-300 hover:from-red-700 hover:via-red-600 hover:to-red-500 shadow-md cursor-pointer hover:shadow-lg"
                            style={{ 
                              height: `${heightPercent}%`,
                              minHeight: revenue > 0 ? '8px' : '2px',
                              opacity: revenue > 0 ? 1 : 0.3
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex items-start justify-between gap-2 mt-3">
                    {revenueByMonth.map((item) => {
                      const monthName = new Date(item.month + '-01').toLocaleDateString('en-US', {
                        month: 'short',
                      })
                      const year = new Date(item.month + '-01').getFullYear().toString().slice(-2)

                      return (
                        <div key={item.month} className="flex-1 text-center">
                          <div className="text-xs font-bold text-gray-700">{monthName}</div>
                          <div className="text-[10px] text-gray-500">'{year}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES{' '}
                  {revenueByMonth
                    .reduce((sum, item) => sum + Number(item.revenue), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Average/Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES{' '}
                  {(
                    revenueByMonth.reduce((sum, item) => sum + Number(item.revenue), 0) /
                    revenueByMonth.length
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-4 sm:p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
            <p className="text-sm text-gray-600">Best performers this period</p>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No sales data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topProducts.map((item, index) => {
              if (!item.product) return null

              const totalRevenue = Number(item._sum.price || 0)
              const totalQuantity = Number(item._sum.quantity || 0)
              const orderCount = item._count.productId
              const imageUrl = item.product.featuredImage || item.product.images[0]?.url

              // Medal colors for top 3
              const rankColors = [
                'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
                'bg-gradient-to-br from-gray-300 to-gray-500 text-white',
                'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
              ]
              const rankColor = index < 3 ? rankColors[index] : 'bg-gray-100 text-gray-600'

              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200"
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 ${rankColor} rounded-xl flex items-center justify-center text-lg font-bold shadow-md`}>
                      #{index + 1}
                    </div>
                  </div>
                  
                  {/* Product Image */}
                  {imageUrl ? (
                    <div className="flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-xl object-cover shadow-sm border-2 border-gray-200"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-200">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 truncate mb-1">{item.product.name}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 font-medium">{totalQuantity} sold</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{orderCount} orders</span>
                    </div>
                  </div>
                  
                  {/* Revenue */}
                  <div className="flex-shrink-0 text-right bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 font-medium mb-0.5">Revenue</p>
                    <p className="text-lg font-bold text-green-900">
                      KES {totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Customer Insights & Product Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Base */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer Base</h2>
              <p className="text-sm text-gray-600">Growing community</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Total Customers</p>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{totalCustomers}</p>
              <p className="text-xs text-gray-500 mt-1">All-time registered</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-5 border border-purple-200">
              <p className="text-sm text-purple-900 font-medium mb-2">Active Rate</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-purple-900">100%</p>
                <p className="text-purple-700 mb-1">({totalCustomers} active)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-lg p-6 border border-orange-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Product Performance</h2>
              <p className="text-sm text-gray-600">Sales overview</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Best Seller Card */}
            {topProducts[0]?.product ? (
              <div className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Best Seller</p>
                </div>
                <div className="flex items-center gap-3">
                  {(() => {
                    const imageUrl = topProducts[0].product.featuredImage || topProducts[0].product.images[0]?.url
                    return imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={topProducts[0].product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{topProducts[0].product.name}</p>
                    <p className="text-sm text-gray-600">{topProducts[0]._sum.quantity} units sold</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-5 border-2 border-orange-200 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No sales data</p>
              </div>
            )}
            
            {/* Total Products Sold */}
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-5 border border-orange-200">
              <p className="text-sm text-orange-900 font-medium mb-2">Total Units Sold</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-orange-900">
                  {topProducts.reduce((sum, item) => sum + Number(item._sum.quantity || 0), 0)}
                </p>
                <p className="text-orange-700 mb-1">products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

