import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Image from 'next/image'
import OrderStatusUpdate from '@/components/admin/orders/OrderStatusUpdate'
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'
import { serializeOrder } from '@/lib/prisma-serialize'

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
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const StatusIcon = statusIcons[order.status] || Clock

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-700 mt-1">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusIcon className="w-6 h-6 text-gray-600" />
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || statusColors.PENDING}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Update */}
          <OrderStatusUpdate order={serializeOrder(order)} />

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={80}
                      height={80}
                      className="rounded object-cover"
                    />
                  ) : item.product?.images?.[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.productName}
                      width={80}
                      height={80}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.productName || item.product?.name || 'Product'}</h3>
                    <p className="text-sm text-gray-600">SKU: {item.productSku || item.product?.sku || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      KES {(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">KES {Number(item.price).toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>KES {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Name:</strong> {order.userName}</p>
              <p><strong>Email:</strong> {order.userEmail}</p>
              <p><strong>Phone:</strong> {order.userPhone}</p>
              <p><strong>Address:</strong> {order.deliveryAddress}</p>
              <p><strong>City:</strong> {order.deliveryCity}</p>
              {order.deliveryNotes && <p><strong>Notes:</strong> {order.deliveryNotes}</p>}
              {order.trackingNumber && (
                <p><strong>Tracking Number:</strong> <span className="font-mono">{order.trackingNumber}</span></p>
              )}
              {order.estimatedDelivery && (
                <p><strong>Estimated Delivery:</strong> {format(new Date(order.estimatedDelivery), 'MMMM d, yyyy')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[order.paymentStatus] || paymentStatusColors.PENDING}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.payment && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="text-gray-900">{order.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-900">
                      KES {Number(order.payment.amount).toLocaleString()}
                    </span>
                  </div>
                  {order.payment.mpesaReceiptNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mpesa Receipt:</span>
                      <span className="font-mono text-sm text-gray-900">{order.payment.mpesaReceiptNumber}</span>
                    </div>
                  )}
                  {order.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid At:</span>
                      <span className="text-gray-900">
                        {format(new Date(order.payment.paidAt), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>KES {Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span>KES {Number(order.deliveryFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>KES {Number(order.tax).toLocaleString()}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-KES {Number(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total:</span>
                  <span>KES {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

