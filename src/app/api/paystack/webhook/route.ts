import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPaystackWebhookSignature, verifyPaystackTransaction } from '@/lib/paystack'
import { sendPaymentReceivedNotification, sendPaymentFailedNotification } from '@/lib/notifications'

/**
 * Paystack Webhook Handler
 * 
 * Paystack sends webhooks to notify about payment events.
 * We verify the webhook signature for security.
 * 
 * Note: Paystack doesn't use IP whitelisting.
 * Security is handled via HMAC SHA512 signature verification.
 */
export async function POST(req: Request) {
  try {
    console.log('📥 Paystack Webhook Received')
    
    // Get webhook secret from environment
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY
    
    if (!webhookSecret) {
      console.error('❌ Paystack webhook secret is not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get raw body for signature verification
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''

    // Verify webhook signature
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (hash !== signature) {
      console.error('❌ Invalid Paystack webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log('✅ Webhook signature verified')

    // Parse webhook body
    const body = JSON.parse(rawBody)
    console.log('📋 Webhook Event:', body.event)
    console.log('📋 Webhook Data:', JSON.stringify(body.data, null, 2))

    // Handle different webhook events
    if (body.event === 'charge.success') {
      const transaction = body.data

      // Find payment by reference
      const payment = await prisma.payment.findUnique({
        where: { paystackReference: transaction.reference },
        include: { order: true },
      })

      if (!payment) {
        console.error(`❌ Payment not found for reference: ${transaction.reference}`)
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }

      // Verify transaction status
      if (transaction.status === 'success') {
        // Update payment
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            paystackAuthorizationCode: transaction.authorization?.authorization_code || null,
            paystackCustomerCode: transaction.customer?.customer_code || null,
            paystackChannel: transaction.channel || null,
            cardLast4: transaction.authorization?.last4 || null,
            cardBrand: transaction.authorization?.brand || null,
            paidAt: transaction.paid_at ? new Date(transaction.paid_at) : new Date(),
            providerResponse: JSON.stringify(body),
          },
        })

        // Update order - set to CONFIRMED after payment is received
        const updatedOrder = await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED', // Changed from PROCESSING to CONFIRMED to indicate payment received
          },
          include: { items: true },
        })

        // Send payment received notification (async)
        sendPaymentReceivedNotification(payment.orderId, {
          orderNumber: payment.order.orderNumber,
          customerEmail: payment.order.userEmail,
          customerPhone: payment.order.userPhone,
          amount: Number(payment.amount),
          receiptNumber: transaction.reference,
          transactionId: transaction.id.toString(),
        }).catch((error) => {
          console.error('Failed to send payment notification:', error)
        })

        // Send order confirmation notification now that payment is received
        const { sendOrderConfirmationNotification } = await import('@/lib/notifications')
        sendOrderConfirmationNotification(payment.orderId, {
          orderNumber: payment.order.orderNumber,
          customerName: payment.order.userName,
          customerEmail: payment.order.userEmail,
          customerPhone: payment.order.userPhone,
          total: Number(payment.order.total),
          items: updatedOrder.items.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: Number(item.price),
            image: item.productImage || undefined,
          })),
          deliveryAddress: payment.order.deliveryAddress,
          deliveryCity: payment.order.deliveryCity,
          paymentMethod: payment.method,
          paymentStatus: 'PAID',
        }).catch((error) => {
          console.error('Failed to send order confirmation notification:', error)
        })

        console.log(`✅ Payment successful for order ${payment.order.orderNumber}`)
        console.log('   Reference:', transaction.reference)
        console.log('   Amount:', transaction.amount / 100, 'KES')
        console.log('   Channel:', transaction.channel)
      } else {
        // Payment failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            errorMessage: transaction.gateway_response || 'Payment failed',
            providerResponse: JSON.stringify(body),
          },
        })

        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'FAILED',
          },
        })

        sendPaymentFailedNotification(payment.orderId, {
          orderNumber: payment.order.orderNumber,
          customerEmail: payment.order.userEmail,
          customerPhone: payment.order.userPhone,
          amount: Number(payment.amount),
          errorMessage: transaction.gateway_response || 'Payment failed',
        }).catch((error) => {
          console.error('Failed to send payment failed notification:', error)
        })

        console.error(`❌ Payment failed for order ${payment.order.orderNumber}`)
      }
    } else if (body.event === 'charge.failed') {
      const transaction = body.data

      const payment = await prisma.payment.findUnique({
        where: { paystackReference: transaction.reference },
        include: { order: true },
      })

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            errorMessage: transaction.gateway_response || 'Payment failed',
            providerResponse: JSON.stringify(body),
          },
        })

        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'FAILED',
          },
        })

        console.error(`❌ Payment failed for order ${payment.order.orderNumber}`)
      }
    }

    // Always return 200 to acknowledge webhook receipt
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

