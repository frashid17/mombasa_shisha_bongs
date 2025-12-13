import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { initiateMpesaSchema } from '@/utils/validations'
import { initiateSTKPush } from '@/lib/mpesa'
import { withRateLimit } from '@/utils/rate-limit'
import { RATE_LIMITS } from '@/utils/constants'
import { createSecureResponse } from '@/utils/security-headers'

async function handlePOST(req: Request) {
  try {
    // Allow both authenticated and guest users to make payments
    const { userId } = await auth()
    // Note: userId can be null for guest users, which is fine

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
      validated = initiateMpesaSchema.parse(body)
    } catch (validationError: any) {
      return createSecureResponse(
        { success: false, error: validationError.message || 'Invalid request data' },
        400
      )
    }

    // Get order with payment relation
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: { 
        items: true, 
        payment: true 
      },
    })

    if (!order) {
      return createSecureResponse(
        { success: false, error: 'Order not found' },
        404
      )
    }

    // Check if order is eligible for payment
    // Allow payment if status is PENDING or if it's a COD order that hasn't been paid
    const existingPayment = order.payment
    const isCOD = existingPayment?.method === 'CASH_ON_DELIVERY'
    
    if (order.paymentStatus !== 'PENDING' && !isCOD) {
      return createSecureResponse(
        {
          success: false,
          error: `Order payment status is ${order.paymentStatus}. Cannot initiate new payment.`,
        },
        400
      )
    }

    // If it's a COD order, we need to create a new Mpesa payment
    if (isCOD && existingPayment) {
      // Delete the COD payment record to create a new Mpesa one
      await prisma.payment.delete({
        where: { id: existingPayment.id },
      })
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
    let stkResponse
    try {
      console.log('Initiating STK Push for order:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        phoneNumber: validated.phoneNumber,
        amount: Number(order.total),
      })
      
      stkResponse = await initiateSTKPush(
        validated.phoneNumber,
        Number(order.total),
        order.orderNumber,
        `Payment for order ${order.orderNumber}`
      )
      
      console.log('STK Push initiated successfully:', {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        customerMessage: stkResponse.CustomerMessage,
        responseCode: stkResponse.ResponseCode,
      })
    } catch (stkError: any) {
      console.error('STK Push initiation failed:', {
        error: stkError.message,
        stack: stkError.stack,
        orderId: order.id,
        phoneNumber: validated.phoneNumber,
      })
      return createSecureResponse(
        {
          success: false,
          error: stkError.message || 'Failed to initiate payment. Please check your Mpesa credentials and try again. Check the server logs for more details.',
        },
        500
      )
    }

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

    return createSecureResponse({
      success: true,
      data: {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        message: stkResponse.CustomerMessage,
        orderId: order.id,
      },
    })
  } catch (error: any) {
    console.error('Mpesa initiation error:', error)
    
    // Ensure we always return JSON, never HTML
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again or contact support.',
      },
      500
    )
  }
}

// Apply rate limiting (strict for payment endpoints)
export const POST = withRateLimit(RATE_LIMITS.MPESA_INITIATE)(handlePOST)

