'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, Download, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { format } from 'date-fns'

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
    id: string
    orderNumber: string
    total: number
    createdAt: Date
    items: Array<{
      id: string
      productName: string
      quantity: number
      price: number
      productImage: string | null
    }>
  }
}

interface PaymentHistoryProps {
  payments: Payment[]
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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
            <Clock className="w-3 h-3" />
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

  async function downloadReceipt(paymentId: string) {
    try {
      const response = await fetch(`/api/payments/${paymentId}/receipt`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Receipt generation error:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to generate receipt')
      }

      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/pdf')) {
        // Handle PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt-${paymentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // Handle HTML (fallback)
        const html = await response.text()
        const blob = new Blob([html], { type: 'text/html' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt-${paymentId}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error: any) {
      console.error('Error downloading receipt:', error)
      alert(error.message || 'Failed to download receipt. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <React.Fragment key={payment.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/orders/${payment.orderId}`}
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        KES {payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4">
                      {payment.mpesaReceiptNumber ? (
                        <span className="font-mono text-sm text-gray-900">
                          {payment.mpesaReceiptNumber}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {payment.paidAt
                            ? format(new Date(payment.paidAt), 'MMM d, yyyy')
                            : format(new Date(payment.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {payment.status === 'PAID' && (
                        <button
                          onClick={() => downloadReceipt(payment.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRows.has(payment.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 mb-3">Order Items:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {payment.order.items.map((item) => (
                              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 flex gap-3">
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
                                  <div className="text-xs text-gray-600 mt-1">
                                    <div>Qty: {item.quantity}</div>
                                    <div>Price: KES {item.price.toLocaleString()}</div>
                                    <div className="font-semibold text-gray-900">Subtotal: KES {(item.price * item.quantity).toLocaleString()}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link
                  href={`/orders/${payment.orderId}`}
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
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              {payment.mpesaReceiptNumber && (
                <div className="text-sm">
                  <span className="text-gray-500">Reference:</span>
                  <span className="ml-2 font-mono font-bold text-gray-900">
                    {payment.mpesaReceiptNumber}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {payment.paidAt
                    ? format(new Date(payment.paidAt), 'MMM d, yyyy HH:mm')
                    : format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
            </div>

            {payment.status === 'PAID' && (
              <button
                onClick={() => downloadReceipt(payment.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

