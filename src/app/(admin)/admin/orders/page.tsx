import prisma from '@/lib/prisma'
import OrdersTable from '@/components/admin/orders/OrdersTable'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'

async function getOrders(userId?: string) {
  return prisma.order.findMany({
    where: userId ? { userId } : undefined,
    include: {
      items: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

async function getCustomerInfo(userId: string) {
  const firstOrder = await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: {
      userName: true,
      userEmail: true,
      userPhone: true,
    },
  })
  return firstOrder
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>
}) {
  const params = await searchParams
  const userId = params.userId
  const orders = await getOrders(userId)
  const customerInfo = userId ? await getCustomerInfo(userId) : null

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-700 mt-1">
              {customerInfo
                ? `Orders for ${customerInfo.userName || customerInfo.userEmail}`
                : 'Manage customer orders'}
            </p>
          </div>
          {userId && (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </Link>
          )}
        </div>
        {customerInfo && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">Customer Information</p>
                <div className="mt-2 space-y-1 text-sm text-blue-800">
                  <p>
                    <strong>Name:</strong> {customerInfo.userName || 'N/A'}
                  </p>
                  <p>
                    <strong>Email:</strong> {customerInfo.userEmail}
                  </p>
                  {customerInfo.userPhone && (
                    <p>
                      <strong>Phone:</strong> {customerInfo.userPhone}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href="/admin/customers"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Customers
              </Link>
            </div>
          </div>
        )}
      </div>
      <OrdersTable orders={orders} />
      {userId && orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found for this customer.</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            View all orders
          </Link>
        </div>
      )}
    </div>
  )
}

