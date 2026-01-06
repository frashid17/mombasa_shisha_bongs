'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Calendar, User, Phone, Mail, MapPin, ChevronDown, ChevronUp, Package, Clock, AlertCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Payment {
  id: string
  orderId: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED'
  mpesaReceiptNumber: string | null
  mpesaSenderName: string | null
  createdAt: Date
  paidAt: Date | null
  order: {
    orderNumber: string
    userName: string
    userEmail: string
    userPhone: string | null
    deliveryAddress: string
    deliveryCity: string
    total: number
    items: Array<{
      productName: string
      quantity: number
      price: number
      productImage: string | null
    }>
  }
}

interface PaymentsTableProps {
  payments: Payment[]
}

type FilterType = 'all' | 'pending' | 'past'

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FilterType>('all')

  // Filter payments
  const filteredPayments = useMemo(() => {
    if (filter === 'pending') {
      return payments.filter(p => p.status === 'PENDING')
    }
    if (filter === 'past') {
      return payments.filter(p => p.status !== 'PENDING')
    }
    return payments
  }, [payments, filter])

  const pendingCount = payments.filter(p => p.status === 'PENDING').length
  const pastCount = payments.filter(p => p.status !== 'PENDING').length

  async function handleApprove(paymentId: string) {
    setLoading(paymentId)

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Payment approved successfully')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to approve payment')
      }
    } catch (error: any) {
      console.error('Approve error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject(paymentId: string) {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setLoading(paymentId)

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Payment rejected successfully')
        setRejectReason('')
        setRejectingId(null)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to reject payment')
      }
    } catch (error: any) {
      console.error('Reject error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(paymentId: string) {
    if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return
    }

    setLoading(paymentId)

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Payment deleted successfully')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to delete payment')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  function getStatusBadge(status: Payment['status']) {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        )
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        )
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3" />
            Refunded
          </span>
        )
    }
  }

  function PaymentCard({ payment }: { payment: Payment }) {
    const isExpanded = expandedRows.has(payment.id)

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              href={`/admin/orders/${payment.orderId}`}
              className="text-red-600 hover:text-red-700 font-semibold text-lg"
            >
              #{payment.order.orderNumber}
            </Link>
            <div className="mt-1">{getStatusBadge(payment.status)}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              KES {payment.amount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Expected: KES {payment.order.total.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{payment.order.userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{payment.order.userEmail}</span>
          </div>
          {payment.order.userPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{payment.order.userPhone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{payment.order.deliveryCity}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="text-sm">
            <span className="text-gray-500">Reference:</span>
            <span className="ml-2 font-mono font-bold text-gray-900">
              {payment.mpesaReceiptNumber}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Sender:</span>
            <span className="ml-2 font-medium text-gray-900">
              {payment.mpesaSenderName || 'Not provided'}
            </span>
          </div>
          {payment.paidAt && (
            <div className="text-xs text-gray-500">
              Paid: {new Date(payment.paidAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              Submitted: {new Date(payment.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Order Items Toggle */}
        <button
          onClick={() => {
            const newExpanded = new Set(expandedRows)
            if (newExpanded.has(payment.id)) {
              newExpanded.delete(payment.id)
            } else {
              newExpanded.add(payment.id)
            }
            setExpandedRows(newExpanded)
          }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors w-full"
        >
          <Package className="w-4 h-4" />
          <span>{payment.order.items.length} item(s)</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          )}
        </button>

        {/* Expanded Order Items */}
        {isExpanded && (
          <div className="border-t border-gray-200 pt-3 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Order Items:</h4>
            <div className="space-y-2">
              {payment.order.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex gap-3">
                  {item.productImage && (
                    <Image
                      src={item.productImage.startsWith('http') ? item.productImage : `${process.env.NEXT_PUBLIC_APP_URL || ''}${item.productImage}`}
                      alt={item.productName}
                      width={60}
                      height={60}
                      className="rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      <div>Qty: {item.quantity}</div>
                      <div>Price: KES {item.price.toLocaleString()}</div>
                      <div className="font-semibold text-gray-900">Subtotal: KES {(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-300 flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Total:</span>
              <span className="text-lg font-bold text-gray-900">KES {payment.order.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 pt-3">
          {payment.status === 'PENDING' ? (
            rejectingId === payment.id ? (
              <div className="space-y-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(payment.id)}
                    disabled={loading === payment.id}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading === payment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'Confirm Reject'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(null)
                      setRejectReason('')
                    }}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(payment.id)}
                  disabled={loading === payment.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading === payment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => setRejectingId(payment.id)}
                  disabled={loading === payment.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )
          ) : (
            <div className="flex gap-2">
              <Link
                href={`/admin/orders/${payment.orderId}`}
                className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                View Order
              </Link>
              <button
                onClick={() => handleDelete(payment.id)}
                disabled={loading === payment.id}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                title="Delete payment"
              >
                {loading === payment.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
        {/* Delete button for pending payments */}
        {payment.status === 'PENDING' && rejectingId !== payment.id && (
          <div className="border-t border-gray-200 pt-3">
            <button
              onClick={() => handleDelete(payment.id)}
              disabled={loading === payment.id}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading === payment.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Payment
                </>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-red-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Payments ({payments.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'pending'
              ? 'bg-red-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'past'
              ? 'bg-red-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Past Payments ({pastCount})
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              {filter === 'pending' ? 'No pending payments' : filter === 'past' ? 'No past payments' : 'No payments found'}
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    {filter === 'pending' ? 'No pending payments' : filter === 'past' ? 'No past payments' : 'No payments found'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <React.Fragment key={payment.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/admin/orders/${payment.orderId}`}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            #{payment.order.orderNumber}
                          </Link>
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedRows)
                              if (newExpanded.has(payment.id)) {
                                newExpanded.delete(payment.id)
                              } else {
                                newExpanded.add(payment.id)
                              }
                              setExpandedRows(newExpanded)
                            }}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 mt-1 transition-colors"
                          >
                            <Package className="w-3 h-3" />
                            <span>{payment.order.items.length} item(s)</span>
                            {expandedRows.has(payment.id) ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{payment.order.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{payment.order.userEmail}</span>
                          </div>
                          {payment.order.userPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{payment.order.userPhone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{payment.order.deliveryCity}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-500">Reference:</span>
                            <span className="ml-2 font-mono font-bold text-gray-900">
                              {payment.mpesaReceiptNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sender:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {payment.mpesaSenderName || 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            KES {payment.amount.toLocaleString()}
                          </div>
                          <div className="text-gray-500 text-xs">
                            Expected: KES {payment.order.total.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(payment.status)}
                          {payment.paidAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Paid: {new Date(payment.paidAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right sticky right-0 bg-white">
                        {payment.status === 'PENDING' ? (
                          rejectingId === payment.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejection..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReject(payment.id)}
                                  disabled={loading === payment.id}
                                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                  {loading === payment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Confirm Reject'
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingId(null)
                                    setRejectReason('')
                                  }}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(payment.id)}
                                disabled={loading === payment.id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                {loading === payment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setRejectingId(payment.id)}
                                disabled={loading === payment.id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                              <button
                                onClick={() => handleDelete(payment.id)}
                                disabled={loading === payment.id}
                                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                title="Delete payment"
                              >
                                {loading === payment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/orders/${payment.orderId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                            >
                              View Order
                            </Link>
                            <button
                              onClick={() => handleDelete(payment.id)}
                              disabled={loading === payment.id}
                              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                              title="Delete payment"
                            >
                              {loading === payment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Expandable Order Items Row */}
                    {expandedRows.has(payment.id) && (
                      <tr key={`${payment.id}-items`} className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-3">Order Items:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {payment.order.items.map((item, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 flex gap-3">
                                  {item.productImage && (
                                    <Image
                                      src={item.productImage.startsWith('http') ? item.productImage : `${process.env.NEXT_PUBLIC_APP_URL || ''}${item.productImage}`}
                                      alt={item.productName}
                                      width={60}
                                      height={60}
                                      className="rounded object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                      <div>Qty: {item.quantity}</div>
                                      <div>Price: KES {item.price.toLocaleString()}</div>
                                      <div className="font-semibold text-gray-900">Subtotal: KES {(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-300 flex justify-end">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Order Total:</div>
                                <div className="text-lg font-bold text-gray-900">KES {payment.order.total.toLocaleString()}</div>
                                <div className="text-sm text-gray-500 mt-1">Amount Paid: KES {payment.amount.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
