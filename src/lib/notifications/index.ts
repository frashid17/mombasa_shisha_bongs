/**
 * Notification Service
 * 
 * Centralized notification service that handles sending emails
 * notifications for orders, payments, and other events.
 * 
 * Note: WhatsApp notifications are disabled for now and will be implemented later.
 */

import { sendEmail } from './email'
import { sendSMS } from './sms'
import { getNotificationTemplate } from './templates'
import { NotificationType } from '@prisma/client'
import prisma from '@/lib/prisma'
import { ADMIN_CONFIG } from '@/utils/constants'

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
 * Sends email to: Customer and Admin
 */
export async function sendOrderConfirmationNotification(
  orderId: string,
  data: OrderNotificationData
): Promise<void> {
  const template = getNotificationTemplate('ORDER_CONFIRMATION', data)

  // Send email to customer
  await sendEmail({
    to: data.customerEmail,
    subject: template.subject || 'Order Confirmation',
    html: template.html || template.text,
    text: template.text,
    orderId,
    type: 'ORDER_CONFIRMATION',
    metadata: { orderNumber: data.orderNumber },
  }).catch(err => console.error('Email send failed:', err))

  // Send email to admin
  const adminEmail = ADMIN_CONFIG.EMAIL
  if (adminEmail) {
    const adminTemplate = {
      subject: `New Order Received - #${data.orderNumber}`,
      html: `
        <h1>New Order Received</h1>
        <p><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Phone:</strong> ${data.customerPhone}</p>
        <p><strong>Delivery Address:</strong> ${data.deliveryAddress}, ${data.deliveryCity}</p>
        <p><strong>Total:</strong> KES ${data.total.toLocaleString()}</p>
        <h2>Order Items:</h2>
        <ul>
          ${data.items.map(item => `<li>${item.name} x${item.quantity} - KES ${item.price.toLocaleString()}</li>`).join('')}
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderId}">View Order in Admin Panel</a></p>
      `,
      text: `New Order #${data.orderNumber} from ${data.customerName}. Total: KES ${data.total.toLocaleString()}. View in admin panel.`,
    }

    await sendEmail({
      to: adminEmail,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
      orderId,
      type: 'ORDER_CONFIRMATION',
      metadata: { orderNumber: data.orderNumber, recipient: 'admin' },
    }).catch(err => console.error('Admin email send failed:', err))
  }
}

/**
 * Send payment received notifications
 * Sends email to: Customer and Admin
 */
export async function sendPaymentReceivedNotification(
  orderId: string,
  data: PaymentNotificationData
): Promise<void> {
  const template = getNotificationTemplate('PAYMENT_RECEIVED', data)

  // Get order details for admin notification
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userName: true },
  })

  // Send email to customer
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
  }).catch(err => console.error('Email send failed:', err))

  // Send email to admin
  const adminEmail = ADMIN_CONFIG.EMAIL
  if (adminEmail) {
    const adminTemplate = {
      subject: `Payment Received - Order #${data.orderNumber}`,
      html: `
        <h1>Payment Received</h1>
        <p><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p><strong>Customer:</strong> ${order?.userName || 'Customer'}</p>
        <p><strong>Amount:</strong> KES ${data.amount.toLocaleString()}</p>
        ${data.receiptNumber ? `<p><strong>Mpesa Receipt:</strong> ${data.receiptNumber}</p>` : ''}
        ${data.transactionId ? `<p><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderId}">View Order in Admin Panel</a></p>
      `,
      text: `Payment received for Order #${data.orderNumber}. Amount: KES ${data.amount.toLocaleString()}. ${data.receiptNumber ? `Receipt: ${data.receiptNumber}` : ''}`,
    }

    await sendEmail({
      to: adminEmail,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
      orderId,
      type: 'PAYMENT_RECEIVED',
      metadata: {
        orderNumber: data.orderNumber,
        receiptNumber: data.receiptNumber,
        recipient: 'admin',
      },
    }).catch(err => console.error('Admin email send failed:', err))
  }
}

/**
 * Send order shipped notifications
 * Sends email to: Customer
 */
export async function sendOrderShippedNotification(
  orderId: string,
  data: OrderNotificationData
): Promise<void> {
  const template = getNotificationTemplate('ORDER_SHIPPED', data)

  // Send email to customer
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
  }).catch(err => console.error('Email send failed:', err))
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

