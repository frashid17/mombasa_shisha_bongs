'use client'

import { useEffect, useState } from 'react'

// Simplified chart component (you can replace with recharts later)
export default function RevenueChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <ChartSkeleton />
  }

  // Mock data for now - you can fetch real data later
  const data = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 15000 },
    { month: 'Apr', revenue: 25000 },
    { month: 'May', revenue: 22000 },
    { month: 'Jun', revenue: 30000 },
  ]

  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
      </div>

      <div className="p-6">
        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-64">
          {data.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-primary-100 rounded-t-lg relative" style={{
                height: `${(item.revenue / maxRevenue) * 100}%`,
                minHeight: '20px'
              }}>
                <div className="absolute top-0 left-0 right-0 h-full bg-primary-500 rounded-t-lg"></div>
              </div>
              <span className="text-xs font-medium text-gray-600">{item.month}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <span>Revenue (KSH)</span>
          <span className="font-semibold">
            Total: KSH {data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
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

