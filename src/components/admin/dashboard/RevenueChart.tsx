'use client'

import { useEffect, useState } from 'react'

// Simplified chart component (you can replace with recharts later)
export default function RevenueChart() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<{ month: string; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/revenue')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) {
    return <ChartSkeleton />
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  // Calculate Y-axis labels (5 evenly spaced values)
  const yAxisLabels = []
  for (let i = 4; i >= 0; i--) {
    yAxisLabels.push(Math.round((maxRevenue / 4) * i))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Last 6 months</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-lg sm:text-xl font-bold text-red-600">
              KES {totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Bar Chart with Y-axis */}
        <div className="flex gap-3 sm:gap-4">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-48 sm:h-64 py-2">
            {yAxisLabels.map((label, index) => (
              <div key={index} className="text-xs text-gray-500 text-right pr-2">
                {label >= 1000 ? `${(label / 1000).toFixed(0)}k` : label}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1">
            {/* Grid lines */}
            <div className="relative h-48 sm:h-64">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                {yAxisLabels.map((_, index) => (
                  <div key={index} className="border-t border-gray-200"></div>
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2 pb-0">
                {data.map((item) => {
                  const heightPercentage = (item.revenue / maxRevenue) * 100
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        KES {item.revenue.toLocaleString()}
                      </div>
                      
                      {/* Bar */}
                      <div 
                        className="w-full bg-gradient-to-t from-red-600 to-red-500 rounded-t-lg hover:from-red-700 hover:to-red-600 transition-all cursor-pointer shadow-sm"
                        style={{
                          height: `${heightPercentage}%`,
                          minHeight: item.revenue > 0 ? '8px' : '0px'
                        }}
                      ></div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* X-axis labels (months) */}
            <div className="flex items-center justify-between gap-1 sm:gap-2 mt-3 pt-3 border-t border-gray-200">
              {data.map((item) => (
                <div key={item.month} className="flex-1 text-center">
                  <span className="text-xs font-medium text-gray-700">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-t from-red-600 to-red-500 rounded"></div>
              <span>Monthly Revenue (KES)</span>
            </div>
            <span className="font-medium text-gray-900">
              Avg: KES {Math.round(totalRevenue / 6).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-gray-100 rounded"></div>
    </div>
  )
}

