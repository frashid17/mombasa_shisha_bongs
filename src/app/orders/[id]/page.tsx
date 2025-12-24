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
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PROCESSING: 'bg-red-100 text-red-800 border-red-300',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
  DELIVERED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-300',
}

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PROCESSING: 'bg-red-100 text-red-800 border-red-300',
  PAID: 'bg-green-100 text-green-800 border-green-300',
  FAILED: 'bg-red-100 text-red-800 border-red-300',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-300',
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
    <div className="min-h-screen bg-white text-gray-900">
      <CartClearer 
        paymentStatus={order.paymentStatus} 
        paymentMethod={order.payment?.method}
        orderId={order.id}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order #{order.orderNumber}</h1>

          {/* Order Status Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-600 mt-2">
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
                  <Truck className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {order.trackingNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="text-gray-900 font-semibold">
                  {format(new Date(order.estimatedDelivery), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Order Status Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Tracking</h2>
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
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-gray-200 border-gray-300 text-gray-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-12 ${
                            isActive ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`font-semibold ${
                              isActive ? 'text-gray-900' : 'text-gray-600'
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.date && isActive && (
                            <p className="text-sm text-gray-600 mt-1">
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Pay on Delivery</h3>
                  <p className="text-green-700">
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Processing</h3>
                  <p className="text-red-700">
                    Your payment is being processed. If you accidentally closed the payment page, you can retry payment below.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <PaystackPaymentButton
                  orderId={order.id}
                  amount={Number(order.total)}
                  orderNumber={order.orderNumber}
                  customerEmail={order.userEmail}
                />
              </div>
            </div>
          )}

          {order.payment?.status === 'PAID' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Successful</h3>
                  {order.payment.mpesaReceiptNumber && (
                    <p className="text-green-700">
                      Receipt Number: {order.payment.mpesaReceiptNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {order.payment?.status === 'FAILED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Failed</h3>
                  <p className="text-red-700">
                    {order.payment.errorMessage || 'Please try again or contact support.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Delivery Section */}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && !order.deliveredAt && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delivery</h2>
              <p className="text-gray-700 mb-4">
                Have you received your order? Please confirm delivery to unlock the ability to review your items.
              </p>
              <ConfirmDeliveryButton
                orderId={order.id}
                orderStatus={order.status}
              />
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">
                      KES {(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Review Form - Show if order is delivered */}
                  {order.status === 'DELIVERED' && order.deliveredAt && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>KES {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong className="text-gray-900">Name:</strong> {order.userName}
              </p>
              <p>
                <strong className="text-gray-900">Email:</strong> {order.userEmail}
              </p>
              <p>
                <strong className="text-gray-900">Phone:</strong> {order.userPhone}
              </p>
              <p>
                <strong className="text-gray-900">Address:</strong> {order.deliveryAddress}
              </p>
              <p>
                <strong className="text-gray-900">City:</strong> {order.deliveryCity}
              </p>
              {order.deliveryNotes && (
                <p>
                  <strong className="text-gray-900">Notes:</strong> {order.deliveryNotes}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          {order.payment && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong className="text-gray-900">Method:</strong> {order.payment.method}
                </p>
                <p>
                  <strong className="text-gray-900">Amount:</strong>{' '}
                  <span className="font-bold text-red-600">
                    KES {Number(order.payment.amount).toLocaleString()}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-900">Status:</strong>{' '}
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${paymentStatusColors[order.payment.status] || paymentStatusColors.PENDING}`}
                  >
                    {order.payment.status}
                  </span>
                </p>
                {order.payment.mpesaReceiptNumber && (
                  <p>
                    <strong className="text-gray-900">Mpesa Receipt:</strong>{' '}
                    {order.payment.mpesaReceiptNumber}
                  </p>
                )}
                {order.payment.paidAt && (
                  <p>
                    <strong className="text-gray-900">Paid At:</strong>{' '}
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

