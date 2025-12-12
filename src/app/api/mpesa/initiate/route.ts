import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { initiateMpesaSchema } from '@/utils/validations'
import { initiateSTKPush } from '@/lib/mpesa'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = initiateMpesaSchema.parse(body)

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order payment already processed' },
        { status: 400 }
      )
    }

    // Check if payment already exists
    let payment = await prisma.payment.findUnique({
      where: { orderId: order.id },
    })

    if (payment && payment.status === 'PAID') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      )
    }

    // Initiate STK Push
    const stkResponse = await initiateSTKPush(
      validated.phoneNumber,
      Number(order.total),
      order.orderNumber,
      `Payment for order ${order.orderNumber}`
    )

    // Create or update payment record
    if (payment) {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          mpesaPhone: validated.phoneNumber,
          mpesaCheckoutRequestId: stkResponse.CheckoutRequestID,
          status: 'PROCESSING',
          providerResponse: JSON.stringify(stkResponse),
        },
      })
    } else {
      payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'MPESA',
          amount: order.total,
          currency: 'KES',
          status: 'PROCESSING',
          mpesaPhone: validated.phoneNumber,
          mpesaCheckoutRequestId: stkResponse.CheckoutRequestID,
          providerResponse: JSON.stringify(stkResponse),
        },
      })
    }

    // Update order payment status
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PROCESSING' },
    })

    return NextResponse.json({
      success: true,
      data: {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        message: stkResponse.CustomerMessage,
        orderId: order.id,
      },
    })
  } catch (error: any) {
    console.error('Mpesa initiation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initiate Mpesa payment',
      },
      { status: 400 }
    )
  }
}

