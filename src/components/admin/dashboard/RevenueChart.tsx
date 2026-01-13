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

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Overview</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Last 6 months</p>
      </div>

      <div className="p-4 sm:p-6">
        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 sm:h-64">
          {data.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-red-100 rounded-t-lg relative" style={{
                height: `${(item.revenue / maxRevenue) * 100}%`,
                minHeight: '20px'
              }}>
                <div className="absolute top-0 left-0 right-0 h-full bg-red-600 rounded-t-lg"></div>
              </div>
              <span className="text-xs font-medium text-gray-600">{item.month}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <span>Revenue (KES)</span>
          <span className="font-semibold">
            Total: KES {data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </span>
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

