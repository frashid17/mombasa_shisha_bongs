import prisma from '@/lib/prisma'
import OrdersTable from '@/components/admin/orders/OrdersTable'

async function getOrders() {
  return prisma.order.findMany({
    include: {
      items: { include: { product: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders</p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  )
}

