import Link from 'next/link'
import { format } from 'date-fns'
import { Eye, Package } from 'lucide-react'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function OrdersTable({ orders }: { orders: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm text-gray-900">#{order.orderNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{order.userName || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{order.userEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{order.items.length} items</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {order.total.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {format(new Date(order.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">No orders found</div>
      )}
    </div>
  )
}

