import prisma from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'

export default async function RecentOrders() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      payment: true,
    },
  })

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            View all
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders yet</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-bold text-red-600 hover:text-red-700"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm font-medium text-gray-900 mt-1">{order.userName}</p>
                    <p className="text-xs text-gray-500 truncate">{order.userEmail}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-900">
                    KES {Number(order.total).toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.userName}</div>
                    <div className="text-sm text-gray-500">{order.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    KES {Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

