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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {selectedOrders.size > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
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
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-3 py-3 text-left w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-600 hover:text-gray-900"
                    aria-label="Select all orders"
                  >
                    {selectedOrders.size === orders.length && orders.length > 0 ? (
                      <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Order #</th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase min-w-[180px]">Customer</th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden sm:table-cell whitespace-nowrap">Items</th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Total</th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Status</th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase hidden md:table-cell whitespace-nowrap">Date</th>
                <th className="px-2 sm:px-3 py-3 text-right text-xs font-semibold text-gray-900 uppercase whitespace-nowrap sticky right-0 bg-gray-50 z-10">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 py-4">
                    <button
                      onClick={() => toggleSelect(order.id)}
                      className="text-gray-600 hover:text-gray-900"
                      aria-label={`Select order ${order.orderNumber}`}
                    >
                      {selectedOrders.has(order.id) ? (
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      ) : (
                        <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-2 sm:px-3 py-4 font-mono text-xs sm:text-sm text-gray-900 whitespace-nowrap">#{order.orderNumber}</td>
                  <td className="px-2 sm:px-3 py-4 text-xs sm:text-sm text-gray-900">
                    <div>
                      <div className="font-medium truncate max-w-[150px] sm:max-w-none">{order.userName || 'Guest'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">{order.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell whitespace-nowrap">{order.items.length} items</td>
                  <td className="px-2 sm:px-3 py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">KES {Number(order.total).toLocaleString()}</td>
                  <td className="px-2 sm:px-3 py-4">
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
                  <td className="px-2 sm:px-3 py-4 text-xs sm:text-sm text-gray-700 hidden md:table-cell whitespace-nowrap">
                    <div>
                      <div>{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                      {order.scheduledDelivery && (
                        <div className="text-purple-600 font-medium mt-1 text-xs">
                          {format(new Date(order.scheduledDelivery), 'MMM d, yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-4 text-right whitespace-nowrap sticky right-0 bg-white z-10">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs sm:text-sm px-1 sm:px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        title="View order"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden lg:inline">View</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id)}
                        disabled={deleting === order.id}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed px-1 sm:px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        aria-label={`Delete order ${order.orderNumber}`}
                        title="Delete order"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden lg:inline">
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
      </div>
      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">No orders found</div>
      )}
    </div>
  )
}

