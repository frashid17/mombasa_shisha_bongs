import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import PaystackPaymentButton from '@/components/payment/PaystackPaymentButton'
import ConfirmDeliveryButton from '@/components/orders/ConfirmDeliveryButton'
import ReviewForm from '@/components/orders/ReviewForm'
import CartClearer from '@/components/orders/CartClearer'
import { CheckCircle, XCircle, Clock, Loader2, Package, Truck, ArrowLeft } from 'lucide-react'

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
  const { userId } = await auth()
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  // Check if user owns this order (allow guest orders)
  if (order.userId !== userId && order.userId !== 'guest') {
    redirect('/orders')
  }

  const isCOD = order.payment?.method === 'CASH_ON_DELIVERY'
  const needsPayment = (order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED') && !isCOD
  const paymentProcessing = order.paymentStatus === 'PROCESSING'

  // Order status timeline
  const statusTimeline = [
    { status: 'PENDING', label: 'Order Placed', date: order.createdAt, icon: Clock },
    { status: 'CONFIRMED', label: 'Order Confirmed', date: order.status === 'CONFIRMED' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.updatedAt : null, icon: CheckCircle },
    { status: 'PROCESSING', label: 'Processing', date: order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.updatedAt : null, icon: Package },
    { status: 'SHIPPED', label: 'Shipped', date: order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (order.updatedAt || order.createdAt) : null, icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', date: order.deliveredAt || (order.status === 'DELIVERED' ? order.updatedAt : null), icon: CheckCircle },
  ]

  const currentStatusIndex = statusTimeline.findIndex((s) => s.status === order.status)
  const activeTimeline = statusTimeline.slice(0, currentStatusIndex + 1)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <CartClearer 
        paymentStatus={order.paymentStatus} 
        paymentMethod={order.payment?.method}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
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

            {/* Tracking Number */}
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Tracking Number</p>
                    <p className="text-lg font-semibold text-white font-mono">
                      {order.trackingNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">Estimated Delivery</p>
                <p className="text-white font-semibold">
                  {format(new Date(order.estimatedDelivery), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Order Status Timeline */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-6">Order Tracking</h2>
            <div className="space-y-4">
              {statusTimeline.map((step, index) => {
                const isActive = activeTimeline.some((s) => s.status === step.status)
                const Icon = step.icon
                const isLast = index === statusTimeline.length - 1

                return (
                  <div key={step.status} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          isActive
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-12 ${
                            isActive ? 'bg-blue-600' : 'bg-gray-700'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`font-semibold ${
                              isActive ? 'text-white' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.date && isActive && (
                            <p className="text-sm text-gray-400 mt-1">
                              {format(new Date(step.date), 'MMMM d, yyyy HH:mm')}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment Section */}
          {isCOD && (
            <div className="bg-green-900/50 border border-green-700 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Pay on Delivery</h3>
                  <p className="text-green-300">
                    Your order is confirmed! Please have KES {Number(order.total).toLocaleString()} ready when your order is delivered.
                  </p>
                </div>
              </div>
            </div>
          )}

          {needsPayment && !isCOD && (
            <div className="mb-6">
              {/* Paystack Payment Option */}
              <PaystackPaymentButton
                orderId={order.id}
                amount={Number(order.total)}
                orderNumber={order.orderNumber}
                customerEmail={order.userEmail}
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
                    Your payment is being processed. Please complete the payment on the Paystack page.
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

          {/* Confirm Delivery Section */}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && !order.deliveredAt && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Confirm Delivery</h2>
              <p className="text-gray-300 mb-4">
                Have you received your order? Please confirm delivery to unlock the ability to review your items.
              </p>
              <ConfirmDeliveryButton
                orderId={order.id}
                orderStatus={order.status}
              />
            </div>
          )}

          {/* Order Items */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-700 p-3 rounded-lg border border-gray-600">
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
                  
                  {/* Review Form - Show if order is delivered */}
                  {order.status === 'DELIVERED' && order.deliveredAt && (
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Review {item.product.name}
                      </h3>
                      <ReviewForm
                        productId={item.productId}
                        productName={item.product.name}
                        orderId={order.id}
                      />
                    </div>
                  )}
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

