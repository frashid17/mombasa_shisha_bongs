'use client'

import Image from 'next/image'
import { TrendingUp, Package, Users, Award, ShoppingCart } from 'lucide-react'

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
  revenueByMonth,
  topProducts,
  totalCustomers,
}: AdvancedAnalyticsProps) {

  return (
    <div className="space-y-4 sm:space-y-6">
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

