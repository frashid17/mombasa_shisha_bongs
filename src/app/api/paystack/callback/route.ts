import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPaystackTransaction } from '@/lib/paystack'
import { sendPaymentReceivedNotification } from '@/lib/notifications'

/**
 * Paystack Callback Handler
 * 
 * This endpoint handles the redirect after payment.
 * Paystack redirects users here after they complete payment.
 * We verify the payment status and update the order accordingly.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    const trxref = searchParams.get('trxref') // Alternative reference parameter

    const paymentReference = reference || trxref

    if (!paymentReference) {
      console.error('❌ No payment reference provided in callback')
      return NextResponse.redirect(new URL('/orders?error=missing_reference', req.url))
    }

    console.log('📥 Paystack callback received:', { reference: paymentReference })

    // Find payment by reference
    let payment
    try {
      payment = await prisma.payment.findUnique({
        where: { paystackReference: paymentReference },
        include: { order: true },
      })
    } catch (dbError: any) {
      console.error('❌ Database error finding payment:', dbError)
      console.error('   Error details:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
      })
      return NextResponse.redirect(new URL('/orders?error=database_error', req.url))
    }

    if (!payment) {
      console.error(`❌ Payment not found for reference: ${paymentReference}`)
      console.error('   This might mean:')
      console.error('   1. Payment was created with a different reference')
      console.error('   2. Database connection issue')
      console.error('   3. Reference format mismatch')
      return NextResponse.redirect(new URL('/orders?error=payment_not_found', req.url))
    }

    // Only verify if payment is not already marked as PAID
    if (payment.status !== 'PAID') {
      try {
        // Verify transaction with Paystack
        const verification = await verifyPaystackTransaction(paymentReference)
        
        console.log('📋 Payment verification result:', {
          status: verification.data.status,
          reference: verification.data.reference,
        })

        // Update payment if successful
        if (verification.data.status === 'success') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'PAID',
              paystackAuthorizationCode: verification.data.authorization?.authorization_code || null,
              paystackCustomerCode: verification.data.customer?.customer_code || null,
              paystackChannel: verification.data.channel || null,
              cardLast4: verification.data.authorization?.last4 || null,
              cardBrand: verification.data.authorization?.brand || null,
              paidAt: verification.data.paid_at ? new Date(verification.data.paid_at) : new Date(),
              providerResponse: JSON.stringify(verification),
            },
          })

          // Update order status - set to CONFIRMED after payment is received
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED', // Changed from PROCESSING to CONFIRMED to indicate payment received
            },
          })

          // Send payment received notification (async)
          sendPaymentReceivedNotification(payment.orderId, {
            orderNumber: payment.order.orderNumber,
            customerEmail: payment.order.userEmail,
            customerPhone: payment.order.userPhone,
            amount: Number(payment.amount),
            receiptNumber: verification.data.reference,
            transactionId: verification.data.id?.toString() || '',
          }).catch((error) => {
            console.error('Failed to send payment notification:', error)
          })

          // Send order confirmation notification now that payment is received
          const { sendOrderConfirmationNotification } = await import('@/lib/notifications')
          const orderWithItems = await prisma.order.findUnique({
            where: { id: payment.orderId },
            include: { items: true },
          })
          
          if (orderWithItems) {
            sendOrderConfirmationNotification(payment.orderId, {
              orderNumber: payment.order.orderNumber,
              customerName: payment.order.userName,
              customerEmail: payment.order.userEmail,
              customerPhone: payment.order.userPhone,
              total: Number(payment.order.total),
              items: orderWithItems.items.map((item) => ({
                name: item.productName,
                quantity: item.quantity,
                price: Number(item.price),
                image: item.productImage || undefined,
                colorId: item.colorId || undefined,
                colorName: item.colorName || undefined,
                colorValue: item.colorValue || undefined,
                specId: item.specId || undefined,
                specType: item.specType || undefined,
                specName: item.specName || undefined,
                specValue: item.specValue || undefined,
              })),
              deliveryAddress: payment.order.deliveryAddress,
              deliveryCity: payment.order.deliveryCity,
              deliveryLatitude: payment.order.deliveryLatitude ? Number(payment.order.deliveryLatitude) : null,
              deliveryLongitude: payment.order.deliveryLongitude ? Number(payment.order.deliveryLongitude) : null,
              paymentMethod: payment.method,
              paymentStatus: 'PAID',
            }).catch((error) => {
              console.error('Failed to send order confirmation notification:', error)
            })
          }

          console.log(`✅ Payment verified and updated for order ${payment.order.orderNumber}`)
        } else {
          // Payment failed
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              errorMessage: verification.data.gateway_response || 'Payment failed',
              providerResponse: JSON.stringify(verification),
            },
          })

          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: 'FAILED',
            },
          })

          console.error(`❌ Payment failed for order ${payment.order.orderNumber}`)
          return NextResponse.redirect(new URL(`/orders/${payment.orderId}?error=payment_failed`, req.url))
        }
      } catch (verifyError: any) {
        console.error('Error verifying payment:', verifyError)
        console.error('   Verification error details:', {
          message: verifyError.message,
          stack: verifyError.stack,
        })
        // Still redirect to order page even if verification fails
        // The webhook might handle it, or user can retry
        return NextResponse.redirect(new URL(`/orders/${payment.orderId}?error=verification_failed`, req.url))
      }
    } else {
      console.log(`✅ Payment already marked as PAID for order ${payment.order.orderNumber}`)
    }

    // Redirect to order page with payment success parameter
    const baseUrl = new URL(req.url).origin
    return NextResponse.redirect(new URL(`/orders/${payment.orderId}?payment=success`, baseUrl))
  } catch (error: any) {
    console.error('❌ Paystack callback error:', error)
    console.error('   Error type:', error?.constructor?.name)
    console.error('   Error message:', error?.message)
    console.error('   Error stack:', error?.stack)
    console.error('   Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // Try to provide more specific error messages
    const baseUrl = new URL(req.url).origin
    if (error?.message?.includes('ECONNREFUSED') || error?.message?.includes('connect')) {
      return NextResponse.redirect(new URL('/orders?error=database_connection_failed', baseUrl))
    }
    if (error?.message?.includes('timeout')) {
      return NextResponse.redirect(new URL('/orders?error=verification_timeout', baseUrl))
    }
    
    return NextResponse.redirect(new URL('/orders?error=callback_failed', baseUrl))
  }
}

