'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Eye, Calendar, Trash2, CheckSquare, Square } from 'lucide-react'
import { toast } from 'react-hot-toast'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-red-100 text-red-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function OrdersTable({ orders: initialOrders }: { orders: any[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const toggleSelect = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)))
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    setDeleting(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete order')
      }

      toast.success('Order deleted successfully')
      // Remove from local state
      setOrders(orders.filter(o => o.id !== orderId))
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting order:', error)
      toast.error(error.message || 'Failed to delete order')
    } finally {
      setDeleting(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one order to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedOrders.size} order(s)? This action cannot be undone.`)) {
      return
    }

    setBulkDeleting(true)
    try {
      const response = await fetch('/api/admin/orders/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedOrders) }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete orders')
      }

      const data = await response.json()
      toast.success(`Successfully deleted ${data.deletedCount} order(s)`)
      
      // Remove deleted orders from local state
      setOrders(orders.filter(o => !selectedOrders.has(o.id)))
      setSelectedOrders(new Set())
      router.refresh()
    } catch (error: any) {
      console.error('Error bulk deleting orders:', error)
      toast.error(error.message || 'Failed to delete orders')
    } finally {
      setBulkDeleting(false)
    }
  }

  // Mobile Card Component
  const OrderCard = ({ order }: { order: any }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {/* Header with selection */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleSelect(order.id)}
            className="text-gray-600 hover:text-gray-900 mt-1 flex-shrink-0"
            aria-label={`Select order ${order.orderNumber}`}
          >
            {selectedOrders.has(order.id) ? (
              <CheckSquare className="w-5 h-5 text-red-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold text-gray-900">#{order.orderNumber}</span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                {order.status}
              </span>
              {order.scheduledDelivery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  <Calendar className="w-3 h-3" />
                  Scheduled
                </span>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">{order.userName || 'Guest'}</p>
              <p className="text-gray-600 text-xs truncate">{order.userEmail}</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Items</p>
            <p className="text-sm font-semibold text-gray-900">{order.items.length} items</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-sm font-bold text-gray-900">KES {Number(order.total).toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-1">Date</p>
            <p className="text-sm text-gray-900">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
            {order.scheduledDelivery && (
              <p className="text-xs text-purple-600 font-medium mt-1">
                Deliver: {format(new Date(order.scheduledDelivery), 'MMM d, yyyy HH:mm')}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
          <Link
            href={`/admin/orders/${order.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Link>
          <button
            onClick={() => handleDelete(order.id)}
            disabled={deleting === order.id}
            className="px-4 py-2.5 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-red-900">
            {selectedOrders.size} order(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            {bulkDeleting ? 'Deleting...' : `Delete ${selectedOrders.size} Order(s)`}
          </button>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-600 hover:text-gray-900"
                    aria-label="Select all orders"
                  >
                    {selectedOrders.size === orders.length && orders.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Order #</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase min-w-[180px]">Customer</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Items</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Total</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Date</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4">
                    <button
                      onClick={() => toggleSelect(order.id)}
                      className="text-gray-600 hover:text-gray-900"
                      aria-label={`Select order ${order.orderNumber}`}
                    >
                      {selectedOrders.has(order.id) ? (
                        <CheckSquare className="w-5 h-5 text-red-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-4 font-mono text-sm text-gray-900 whitespace-nowrap">#{order.orderNumber}</td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.userName || 'Guest'}</div>
                      <div className="text-xs text-gray-500">{order.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">{order.items.length} items</td>
                  <td className="px-3 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">KES {Number(order.total).toLocaleString()}</td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                      {order.scheduledDelivery && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
                          <Calendar className="w-3 h-3" />
                          Scheduled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-700 whitespace-nowrap">
                    <div>
                      <div>{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                      {order.scheduledDelivery && (
                        <div className="text-purple-600 font-medium mt-1 text-xs">
                          {format(new Date(order.scheduledDelivery), 'MMM d, yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        title="View order"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id)}
                        disabled={deleting === order.id}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        aria-label={`Delete order ${order.orderNumber}`}
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {deleting === order.id ? 'Deleting...' : 'Delete'}
                        </span>
                      </button>
                    </div>
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
    </>
  )
}

