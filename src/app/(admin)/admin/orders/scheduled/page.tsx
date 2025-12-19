import prisma from '@/lib/prisma'
import OrdersTable from '@/components/admin/orders/OrdersTable'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'

async function getScheduledOrders() {
  const now = new Date()
  
  return prisma.order.findMany({
    where: {
      scheduledDelivery: {
        not: null,
      },
      status: {
        notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
      },
    },
    include: {
      items: true,
      payment: true,
    },
    orderBy: {
      scheduledDelivery: 'asc',
    },
  })
}

export default async function ScheduledDeliveriesPage() {
  const orders = await getScheduledOrders()
  const now = new Date()
  
  // Separate orders into upcoming (today and future) and past
  const upcomingOrders = orders.filter(
    (order) => order.scheduledDelivery && new Date(order.scheduledDelivery) >= now
  )
  const pastOrders = orders.filter(
    (order) => order.scheduledDelivery && new Date(order.scheduledDelivery) < now
  )

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Deliveries</h1>
        </div>
        <p className="text-gray-700">
          Manage orders with scheduled delivery dates and times
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-green-600">{upcomingOrders.length}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Past Due</p>
              <p className="text-2xl font-bold text-red-600">{pastOrders.length}</p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Upcoming Scheduled Orders */}
      {upcomingOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Deliveries</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Scheduled For</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingOrders.map((order) => {
                    const scheduledDate = order.scheduledDelivery ? new Date(order.scheduledDelivery) : null
                    const isToday = scheduledDate && format(scheduledDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm text-gray-900">#{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{order.userName || 'Guest'}</div>
                          <div className="text-xs text-gray-500">{order.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {scheduledDate && (
                            <div>
                              <div className={`font-medium ${isToday ? 'text-purple-600' : ''}`}>
                                {format(scheduledDate, 'MMM d, yyyy')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(scheduledDate, 'HH:mm')}
                              </div>
                              {isToday && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                                  Today
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          KES {Number(order.total).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`/admin/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Past Due Scheduled Orders */}
      {pastOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-red-600">Past Due Deliveries</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden border-2 border-red-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Was Scheduled For</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pastOrders.map((order) => {
                    const scheduledDate = order.scheduledDelivery ? new Date(order.scheduledDelivery) : null
                    
                    return (
                      <tr key={order.id} className="hover:bg-red-50">
                        <td className="px-6 py-4 font-mono text-sm text-gray-900">#{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{order.userName || 'Guest'}</div>
                          <div className="text-xs text-gray-500">{order.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          {scheduledDate && (
                            <div>
                              <div className="font-medium">
                                {format(scheduledDate, 'MMM d, yyyy')}
                              </div>
                              <div className="text-xs">
                                {format(scheduledDate, 'HH:mm')}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          KES {Number(order.total).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`/admin/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Deliveries</h3>
          <p className="text-gray-600">
            Orders with scheduled delivery dates will appear here.
          </p>
        </div>
      )}
    </div>
  )
}

