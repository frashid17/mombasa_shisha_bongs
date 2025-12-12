import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Image from 'next/image'
import MpesaPaymentButton from '@/components/payment/MpesaPaymentButton'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'

async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      },
      payment: true,
    },
  })
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-900 text-yellow-300 border-yellow-700',
  PROCESSING: 'bg-blue-900 text-blue-300 border-blue-700',
  SHIPPED: 'bg-purple-900 text-purple-300 border-purple-700',
  DELIVERED: 'bg-green-900 text-green-300 border-green-700',
  CANCELLED: 'bg-red-900 text-red-300 border-red-700',
  REFUNDED: 'bg-gray-900 text-gray-300 border-gray-700',
}

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-900 text-yellow-300 border-yellow-700',
  PROCESSING: 'bg-blue-900 text-blue-300 border-blue-700',
  PAID: 'bg-green-900 text-green-300 border-green-700',
  FAILED: 'bg-red-900 text-red-300 border-red-700',
  REFUNDED: 'bg-gray-900 text-gray-300 border-gray-700',
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const needsPayment = order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED'
  const paymentProcessing = order.paymentStatus === 'PROCESSING'

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Order #{order.orderNumber}</h1>

          {/* Order Status Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Order Number</p>
                <p className="text-lg font-semibold text-white">{order.orderNumber}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy HH:mm')}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || statusColors.PENDING}`}
                >
                  {order.status}
                </span>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${paymentStatusColors[order.paymentStatus] || paymentStatusColors.PENDING}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          {needsPayment && (
            <div className="mb-6">
              <MpesaPaymentButton
                orderId={order.id}
                amount={Number(order.total)}
                orderNumber={order.orderNumber}
                phoneNumber={order.userPhone}
              />
            </div>
          )}

          {paymentProcessing && (
            <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Payment Processing</h3>
                  <p className="text-blue-300">
                    Please check your phone and enter your Mpesa PIN to complete the payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {order.payment?.status === 'PAID' && (
            <div className="bg-green-900/50 border border-green-700 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Payment Successful</h3>
                  {order.payment.mpesaReceiptNumber && (
                    <p className="text-green-300">
                      Receipt Number: {order.payment.mpesaReceiptNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {order.payment?.status === 'FAILED' && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Payment Failed</h3>
                  <p className="text-red-300">
                    {order.payment.errorMessage || 'Please try again or contact support.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-gray-700 p-3 rounded-lg border border-gray-600"
                >
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      width={60}
                      height={60}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.product.name}</p>
                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-white">
                    KES {(Number(item.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>KES {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Delivery Information</h2>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong className="text-white">Name:</strong> {order.userName}
              </p>
              <p>
                <strong className="text-white">Email:</strong> {order.userEmail}
              </p>
              <p>
                <strong className="text-white">Phone:</strong> {order.userPhone}
              </p>
              <p>
                <strong className="text-white">Address:</strong> {order.deliveryAddress}
              </p>
              <p>
                <strong className="text-white">City:</strong> {order.deliveryCity}
              </p>
              {order.deliveryNotes && (
                <p>
                  <strong className="text-white">Notes:</strong> {order.deliveryNotes}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          {order.payment && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong className="text-white">Method:</strong> {order.payment.method}
                </p>
                <p>
                  <strong className="text-white">Amount:</strong>{' '}
                  <span className="font-bold text-blue-400">
                    KES {Number(order.payment.amount).toLocaleString()}
                  </span>
                </p>
                <p>
                  <strong className="text-white">Status:</strong>{' '}
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${paymentStatusColors[order.payment.status] || paymentStatusColors.PENDING}`}
                  >
                    {order.payment.status}
                  </span>
                </p>
                {order.payment.mpesaReceiptNumber && (
                  <p>
                    <strong className="text-white">Mpesa Receipt:</strong>{' '}
                    {order.payment.mpesaReceiptNumber}
                  </p>
                )}
                {order.payment.paidAt && (
                  <p>
                    <strong className="text-white">Paid At:</strong>{' '}
                    {format(new Date(order.payment.paidAt), 'MMMM d, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

