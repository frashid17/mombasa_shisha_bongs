'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'

interface OrderStatusUpdateProps {
  order: {
    id: string
    orderNumber: string
    status: string
    trackingNumber: string | null
    estimatedDelivery: Date | null
  }
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', icon: Clock, description: 'Order is pending confirmation' },
  { value: 'PROCESSING', label: 'Processing', icon: Package, description: 'Order is being prepared' },
  { value: 'SHIPPED', label: 'Shipped', icon: Truck, description: 'Order has been shipped' },
  { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle, description: 'Order has been delivered' },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, description: 'Order has been cancelled' },
]

export default function OrderStatusUpdate({ order }: OrderStatusUpdateProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '')
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : ''
  )
  const [adminNotes, setAdminNotes] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber.trim() || undefined,
          estimatedDelivery: estimatedDelivery || undefined,
          adminNotes: adminNotes.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.refresh()
        setShowForm(false)
        alert('Order status updated successfully!')
      } else {
        alert(data.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showForm ? 'Cancel' : 'Update Status'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">New Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {statusOptions.map((option) => {
                const Icon = option.icon
                return (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                )
              })}
            </select>
          </div>

          {status === 'SHIPPED' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Estimated Delivery</label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Admin Notes (Optional)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about this status update..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="text-gray-600">
          <p>Current Status: <strong className="text-gray-900">{status}</strong></p>
          {order.trackingNumber && (
            <p className="mt-2">Tracking: <span className="font-mono text-gray-900">{order.trackingNumber}</span></p>
          )}
        </div>
      )}
    </div>
  )
}

