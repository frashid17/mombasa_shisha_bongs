import { Suspense } from 'react'
import StatsCards from '@/components/admin/dashboard/StatsCards'
import RecentOrders from '@/components/admin/dashboard/RecentOrders'
import TopProducts from '@/components/admin/dashboard/TopProducts'
import RevenueChart from '@/components/admin/dashboard/RevenueChart'

export const metadata = {
  title: 'Admin Dashboard - Mombasa Shisha Bongs',
  description: 'Admin dashboard for managing products, orders, and customers',
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>

        {/* Top Products */}
        <Suspense fallback={<ChartSkeleton />}>
          <TopProducts />
        </Suspense>
      </div>

      {/* Recent Orders */}
      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}

// Loading Skeletons
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
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

function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  )
}

