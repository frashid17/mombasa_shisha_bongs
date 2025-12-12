/**
 * Notification Service
 * 
 * Centralized notification service that handles sending emails and SMS/WhatsApp
 * notifications for orders, payments, and other events.
 */

import { sendEmail } from './email'
import { sendSMS, sendWhatsApp } from './sms'
import { getNotificationTemplate } from './templates'
import { NotificationType } from '@prisma/client'
import prisma from '@/lib/prisma'

interface OrderNotificationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  deliveryAddress: string
  deliveryCity: string
  estimatedDelivery?: string
  trackingNumber?: string
}

interface PaymentNotificationData {
  orderNumber: string
  customerEmail: string
  customerPhone: string
  amount: number
  receiptNumber?: string
  transactionId?: string
}

/**
 * Send order confirmation notifications
 */
export async function sendOrderConfirmationNotification(
  orderId: string,
  data: OrderNotificationData
): Promise<void> {
  const template = getNotificationTemplate('ORDER_CONFIRMATION', data)

  // Send email
  await sendEmail({
    to: data.customerEmail,
    subject: template.subject || 'Order Confirmation',
    html: template.html || template.text,
    text: template.text,
    orderId,
    type: 'ORDER_CONFIRMATION',
    metadata: { orderNumber: data.orderNumber },
  })

  // Send SMS
  if (data.customerPhone) {
    await sendSMS({
      to: data.customerPhone,
      message: template.sms || template.text,
      orderId,
      type: 'ORDER_CONFIRMATION',
      metadata: { orderNumber: data.orderNumber },
    })
  }
}

/**
 * Send payment received notifications
 */
export async function sendPaymentReceivedNotification(
  orderId: string,
  data: PaymentNotificationData
): Promise<void> {
  const template = getNotificationTemplate('PAYMENT_RECEIVED', data)

  // Send email
  await sendEmail({
    to: data.customerEmail,
    subject: template.subject || 'Payment Received',
    html: template.html || template.text,
    text: template.text,
    orderId,
    type: 'PAYMENT_RECEIVED',
    metadata: {
      orderNumber: data.orderNumber,
      receiptNumber: data.receiptNumber,
      transactionId: data.transactionId,
    },
  })

  // Send SMS
  if (data.customerPhone) {
    await sendSMS({
      to: data.customerPhone,
      message: template.sms || template.text,
      orderId,
      type: 'PAYMENT_RECEIVED',
      metadata: {
        orderNumber: data.orderNumber,
        receiptNumber: data.receiptNumber,
      },
    })
  }
}

/**
 * Send order shipped notifications
 */
export async function sendOrderShippedNotification(
  orderId: string,
  data: OrderNotificationData
): Promise<void> {
  const template = getNotificationTemplate('ORDER_SHIPPED', data)

  // Send email
  await sendEmail({
    to: data.customerEmail,
    subject: template.subject || 'Order Shipped',
    html: template.html || template.text,
    text: template.text,
    orderId,
    type: 'ORDER_SHIPPED',
    metadata: {
      orderNumber: data.orderNumber,
      trackingNumber: data.trackingNumber,
    },
  })

  // Send SMS
  if (data.customerPhone) {
    await sendSMS({
      to: data.customerPhone,
      message: template.sms || template.text,
      orderId,
      type: 'ORDER_SHIPPED',
      metadata: {
        orderNumber: data.orderNumber,
        trackingNumber: data.trackingNumber,
      },
    })
  }
}

/**
 * Send order delivered notifications
 */
export async function sendOrderDeliveredNotification(
  orderId: string,
  data: OrderNotificationData
): Promise<void> {
  const template = {
    subject: `Order Delivered - #${data.orderNumber}`,
    html: `
      <h1>🎉 Your Order Has Been Delivered!</h1>
      <p>Order #${data.orderNumber} has been successfully delivered.</p>
      <p>Thank you for shopping with us!</p>
    `,
    text: `Order #${data.orderNumber} has been delivered. Thank you for shopping with us!`,
    sms: `Order #${data.orderNumber} delivered! Thank you for shopping with Mombasa Shisha Bongs.`,
  }

  // Send email
  await sendEmail({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    orderId,
    type: 'ORDER_DELIVERED',
    metadata: { orderNumber: data.orderNumber },
  })

  // Send SMS
  if (data.customerPhone) {
    await sendSMS({
      to: data.customerPhone,
      message: template.sms,
      orderId,
      type: 'ORDER_DELIVERED',
      metadata: { orderNumber: data.orderNumber },
    })
  }
}

/**
 * Send payment failed notifications
 */
export async function sendPaymentFailedNotification(
  orderId: string,
  data: PaymentNotificationData & { errorMessage?: string }
): Promise<void> {
  const template = {
    subject: `Payment Failed - Order #${data.orderNumber}`,
    html: `
      <h1>Payment Failed</h1>
      <p>We were unable to process your payment for Order #${data.orderNumber}.</p>
      ${data.errorMessage ? `<p>Error: ${data.errorMessage}</p>` : ''}
      <p>Please try again or contact support.</p>
    `,
    text: `Payment failed for Order #${data.orderNumber}. Please try again or contact support.`,
    sms: `Payment failed for Order #${data.orderNumber}. Please try again or contact support.`,
  }

  // Send email
  await sendEmail({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    orderId,
    type: 'PAYMENT_FAILED',
    metadata: {
      orderNumber: data.orderNumber,
      errorMessage: data.errorMessage,
    },
  })

  // Send SMS
  if (data.customerPhone) {
    await sendSMS({
      to: data.customerPhone,
      message: template.sms,
      orderId,
      type: 'PAYMENT_FAILED',
      metadata: {
        orderNumber: data.orderNumber,
        errorMessage: data.errorMessage,
      },
    })
  }
}

