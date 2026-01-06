import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const user = await currentUser()
    const role = (user?.publicMetadata as { role?: string })?.role

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get pending payments
    const payments = await prisma.payment.findMany({
      where: {
        method: 'MPESA',
        status: 'PENDING',
        mpesaReceiptNumber: { not: null },
      },
      include: {
        order: {
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Serialize Decimal values
    const serializedPayments = payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
      order: {
        ...payment.order,
        subtotal: Number(payment.order.subtotal),
        deliveryFee: Number(payment.order.deliveryFee),
        tax: Number(payment.order.tax),
        discount: Number(payment.order.discount),
        total: Number(payment.order.total),
      },
    }))

    return NextResponse.json({ payments: serializedPayments })
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

