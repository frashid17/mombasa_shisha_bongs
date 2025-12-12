import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPaymentReceivedNotification, sendPaymentFailedNotification } from '@/lib/notifications'

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value: string | number
        }>
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const body: MpesaCallbackBody = await req.json()

    const stkCallback = body.Body?.stkCallback
    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid callback format' }, { status: 400 })
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    // Find payment by checkout request ID
    const payment = await prisma.payment.findUnique({
      where: { mpesaCheckoutRequestId: CheckoutRequestID },
      include: { order: true },
    })

    if (!payment) {
      console.error(`Payment not found for CheckoutRequestID: ${CheckoutRequestID}`)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Process callback based on result code
    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || []
      const receiptNumber = metadata.find((item) => item.Name === 'MpesaReceiptNumber')?.Value as
        | string
        | undefined
      const transactionDate = metadata.find((item) => item.Name === 'TransactionDate')?.Value as
        | string
        | undefined
      const phoneNumber = metadata.find((item) => item.Name === 'PhoneNumber')?.Value as
        | string
        | undefined
      const amount = metadata.find((item) => item.Name === 'Amount')?.Value as
        | number
        | undefined

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          mpesaReceiptNumber: receiptNumber || null,
          mpesaTransactionId: CheckoutRequestID,
          paidAt: new Date(),
          providerResponse: JSON.stringify(body),
        },
      })

      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING', // Move to processing after payment
        },
        include: { items: true },
      })

      // Send payment received notification (async, don't wait)
      sendPaymentReceivedNotification(payment.orderId, {
        orderNumber: payment.order.orderNumber,
        customerEmail: payment.order.userEmail,
        customerPhone: payment.order.userPhone,
        amount: Number(payment.amount),
        receiptNumber: receiptNumber || undefined,
        transactionId: CheckoutRequestID,
      }).catch((error) => {
        console.error('Failed to send payment notification:', error)
        // Don't fail the callback if notification fails
      })

      console.log(`Payment successful for order ${payment.order.orderNumber}`)
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          errorMessage: ResultDesc,
          providerResponse: JSON.stringify(body),
        },
      })

      const updatedOrder = await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'FAILED',
        },
        include: { items: true },
      })

      // Send payment failed notification (async, don't wait)
      sendPaymentFailedNotification(payment.orderId, {
        orderNumber: payment.order.orderNumber,
        customerEmail: payment.order.userEmail,
        customerPhone: payment.order.userPhone,
        amount: Number(payment.amount),
        errorMessage: ResultDesc,
      }).catch((error) => {
        console.error('Failed to send payment failed notification:', error)
        // Don't fail the callback if notification fails
      })

      console.error(`Payment failed for order ${payment.order.orderNumber}: ${ResultDesc}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mpesa callback error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process callback' },
      { status: 500 }
    )
  }
}

