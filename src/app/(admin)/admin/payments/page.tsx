import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import PaymentsTable from '@/components/admin/payments/PaymentsTable'
import CleanupDuplicatesButton from '@/components/admin/payments/CleanupDuplicatesButton'

async function getPayments() {
  const payments = await prisma.payment.findMany({
    where: {
      method: 'MPESA',
      mpesaReceiptNumber: { not: null },
    },
    include: {
      order: {
        include: {
          items: true, // OrderItem already has productImage stored
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Serialize Decimal values and order items
  return payments.map((payment) => ({
    ...payment,
    amount: Number(payment.amount),
    order: {
      ...payment.order,
      subtotal: Number(payment.order.subtotal),
      deliveryFee: Number(payment.order.deliveryFee),
      tax: Number(payment.order.tax),
      discount: Number(payment.order.discount),
      total: Number(payment.order.total),
      items: payment.order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
        productImage: item.productImage || null,
      })),
    },
  }))
}

export default async function PaymentsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/admin/payments')
  }

  // Check admin role (same as admin layout)
  const user = await currentUser()
  const role = (user?.publicMetadata as { role?: string })?.role

  if (role !== 'admin') {
    redirect('/')
  }

  const payments = await getPayments()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Payments</h1>
            <p className="text-gray-600 mt-2">
              View and manage all M-Pesa payments submitted by customers
            </p>
          </div>
          <CleanupDuplicatesButton />
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">No payments found</p>
          <p className="text-gray-500 text-sm mt-2">
            There are no M-Pesa payments in the system yet.
          </p>
        </div>
      ) : (
        <PaymentsTable payments={payments} />
      )}
    </div>
  )
}

