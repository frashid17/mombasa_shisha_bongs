import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import PaymentHistory from '@/components/payments/PaymentHistory'
import { serializePayment } from '@/lib/prisma-serialize'

async function getCustomerPayments(userId: string) {
  // Get all orders for the user
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      payment: true,
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Filter orders that have payments and serialize
  return orders
    .filter(order => order.payment !== null)
    .map(order => ({
      ...serializePayment(order.payment!),
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
          productImage: item.productImage || item.product?.images[0]?.url || null,
        })),
      },
    }))
}

export default async function PaymentsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/payments')
  }

  const payments = await getCustomerPayments(userId)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">
            View all your payment transactions and download receipts
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No payment history found</p>
            <p className="text-gray-500 text-sm mt-2">
              Your payment history will appear here once you make a payment.
            </p>
          </div>
        ) : (
          <PaymentHistory payments={payments} />
        )}
      </div>
    </div>
  )
}

