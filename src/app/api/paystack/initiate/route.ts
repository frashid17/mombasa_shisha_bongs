import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { initializePaystackPayment } from '@/lib/paystack'
import { createSecureResponse } from '@/utils/security-headers'
import { z } from 'zod'

const initiatePaystackSchema = z.object({
  orderId: z.string().min(1),
  email: z.string().email(),
})

async function handlePOST(req: Request) {
  try {
    const { userId } = await auth()
    // Allow both authenticated and guest users

    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return createSecureResponse(
        { success: false, error: 'Invalid request body. Expected JSON.' },
        400
      )
    }

    let validated
    try {
      validated = initiatePaystackSchema.parse(body)
    } catch (validationError: any) {
      return createSecureResponse(
        { success: false, error: validationError.message || 'Invalid request data' },
        400
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: {
        items: true,
        payment: true,
      },
    })

    if (!order) {
      return createSecureResponse(
        { success: false, error: 'Order not found' },
        404
      )
    }

    // Check if order is eligible for payment
    if (order.paymentStatus !== 'PENDING' && order.payment?.method !== 'CASH_ON_DELIVERY') {
      return createSecureResponse(
        {
          success: false,
          error: `Order payment status is ${order.paymentStatus}. Cannot initiate new payment.`,
        },
        400
      )
    }

    // Check if payment already exists and is paid
    if (order.payment && order.payment.status === 'PAID') {
      return createSecureResponse(
        { success: false, error: 'Payment already completed' },
        400
      )
    }

    // Generate unique reference
    const reference = `ORD-${order.orderNumber}-${Date.now()}`

    // Initialize Paystack payment
    let paystackResponse
    try {
      console.log('Initializing Paystack payment:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        email: validated.email,
        amount: Number(order.total),
        reference,
      })

      paystackResponse = await initializePaystackPayment(
        validated.email,
        Number(order.total),
        reference,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.userName,
          customerPhone: order.userPhone,
        }
      )

      console.log('Paystack payment initialized:', {
        reference: paystackResponse.data.reference,
        authorizationUrl: paystackResponse.data.authorization_url,
      })
    } catch (paystackError: any) {
      console.error('Paystack initialization failed:', {
        error: paystackError.message,
        stack: paystackError.stack,
        orderId: order.id,
      })
      return createSecureResponse(
        {
          success: false,
          error: paystackError.message || 'Failed to initialize payment. Please try again.',
        },
        500
      )
    }

    // Create or update payment record
    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          method: 'PAYSTACK',
          paystackReference: paystackResponse.data.reference,
          status: 'PROCESSING',
          providerResponse: JSON.stringify(paystackResponse),
        },
      })
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'PAYSTACK',
          amount: order.total,
          currency: 'KES',
          status: 'PROCESSING',
          paystackReference: paystackResponse.data.reference,
          providerResponse: JSON.stringify(paystackResponse),
        },
      })
    }

    // Update order payment status
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PROCESSING' },
    })

    return createSecureResponse({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
        accessCode: paystackResponse.data.access_code,
      },
    })
  } catch (error: any) {
    console.error('Paystack initiation error:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again or contact support.',
      },
      500
    )
  }
}

export const POST = handlePOST

