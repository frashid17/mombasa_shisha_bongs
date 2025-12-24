import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react'
import { serializeOrder } from '@/lib/prisma-serialize'

async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
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
    orderBy: { createdAt: 'desc' },
  })
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMED: 'bg-red-100 text-red-800 border-red-300',
  PROCESSING: 'bg-red-100 text-red-800 border-red-300',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
  DELIVERED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-300',
}

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: XCircle,
}

export default async function OrdersPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/orders')
  }

  const orders = await getOrders(userId)
  const serializedOrders = orders.map(serializeOrder)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">View and track your order history</p>
          </div>

          {serializedOrders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <Link
                href="/products"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {serializedOrders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock
                const isCOD = order.payment?.method === 'CASH_ON_DELIVERY'

                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:border-red-500 hover:shadow-md transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-5 h-5 text-gray-600" />
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || statusColors.PENDING}`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Order #{order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(order.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="flex items-center gap-4 mb-3">
                            {order.items.slice(0, 3).map((item: any) => (
                              <div key={item.id} className="flex items-center gap-2">
                                {item.productImage ? (
                                  <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    width={40}
                                    height={40}
                                    className="rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                                    No Img
                                  </div>
                                )}
                                <span className="text-sm text-gray-700">
                                  {item.productName} × {item.quantity}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-sm text-gray-600">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Payment Status */}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">Payment:</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                order.paymentStatus === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'FAILED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {isCOD ? 'Pay on Delivery' : order.paymentStatus}
                            </span>
                            {order.trackingNumber && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">
                                  Tracking: {order.trackingNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Total & Arrow */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Total</p>
                            <p className="text-xl font-bold text-gray-900">
                              KES {order.total.toLocaleString()}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

