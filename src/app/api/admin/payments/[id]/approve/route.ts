import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { sendPaymentReceivedNotification } from '@/lib/notifications'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const user = await currentUser()
    const role = (user?.publicMetadata as { role?: string })?.role

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get payment with order
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'PAID') {
      return NextResponse.json(
        { error: 'Payment already approved' },
        { status: 400 }
      )
    }

    // Update payment status
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    })

    // Update order payment status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    })

    // Send payment received notification to customer
    await sendPaymentReceivedNotification(payment.orderId, {
      orderNumber: payment.order.orderNumber,
      customerEmail: payment.order.userEmail,
      customerPhone: payment.order.userPhone || '',
      amount: Number(payment.amount),
      receiptNumber: payment.mpesaReceiptNumber || undefined,
      transactionId: payment.mpesaTransactionId || undefined,
    }).catch(err => {
      console.error('Failed to send payment notification:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully',
    })
  } catch (error: any) {
    console.error('Error approving payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve payment' },
      { status: 500 }
    )
  }
}

