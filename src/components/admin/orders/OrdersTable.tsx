import Link from 'next/link'
import { format } from 'date-fns'
import { Eye, Package, Calendar } from 'lucide-react'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-red-100 text-red-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function OrdersTable({ orders }: { orders: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Order #</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Customer</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden sm:table-cell">Items</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Total</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden md:table-cell">Date</th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 font-mono text-xs sm:text-sm text-gray-900 whitespace-nowrap">#{order.orderNumber}</td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.userName || 'Guest'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">{order.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{order.items.length} items</td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">KES {order.total.toLocaleString()}</td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                      {order.scheduledDelivery && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          <Calendar className="w-3 h-3" />
                          Scheduled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 hidden md:table-cell whitespace-nowrap">
                    <div>
                      <div>{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                      {order.scheduledDelivery && (
                        <div className="text-purple-600 font-medium mt-1">
                          {format(new Date(order.scheduledDelivery), 'MMM d, yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">No orders found</div>
      )}
    </div>
  )
}

