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
 * Sends WhatsApp to: Delivery Person, Admin, and Buyer
 */
export async function sendOrderConfirmationNotification(
  orderId: string,
  data: OrderNotificationData
): Promise<void> {
  const template = getNotificationTemplate('ORDER_CONFIRMATION', data)
  const { WHATSAPP_CONFIG } = await import('@/utils/constants')
  const { 
    getDeliveryPersonOrderNotification, 
    getAdminOrderNotification 
  } = await import('./whatsapp-templates')

  // Send email (optional, can be disabled)
  await sendEmail({
    to: data.customerEmail,
    subject: template.subject || 'Order Confirmation',
    html: template.html || template.text,
    text: template.text,
    orderId,
    type: 'ORDER_CONFIRMATION',
    metadata: { orderNumber: data.orderNumber },
  }).catch(err => console.error('Email send failed:', err))

  // Send WhatsApp to Delivery Person
  if (WHATSAPP_CONFIG.DELIVERY_PHONE) {
    await sendWhatsApp({
      to: WHATSAPP_CONFIG.DELIVERY_PHONE,
      message: getDeliveryPersonOrderNotification({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        total: data.total,
        items: data.items,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
      }),
      orderId,
      type: 'ORDER_CONFIRMATION',
      metadata: { orderNumber: data.orderNumber, recipient: 'delivery_person' },
    }).catch(err => console.error('WhatsApp to delivery person failed:', err))
  }

  // Send WhatsApp to Admin
  if (WHATSAPP_CONFIG.ADMIN_PHONE) {
    await sendWhatsApp({
      to: WHATSAPP_CONFIG.ADMIN_PHONE,
      message: getAdminOrderNotification({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        total: data.total,
        items: data.items,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
      }),
      orderId,
      type: 'ORDER_CONFIRMATION',
      metadata: { orderNumber: data.orderNumber, recipient: 'admin' },
    }).catch(err => console.error('WhatsApp to admin failed:', err))
  }
}

/**
 * Send payment received notifications
 * Sends WhatsApp to: Buyer and Admin
 */
export async function sendPaymentReceivedNotification(
  orderId: string,
  data: PaymentNotificationData
): Promise<void> {
  const template = getNotificationTemplate('PAYMENT_RECEIVED', data)
  const { WHATSAPP_CONFIG } = await import('@/utils/constants')
  const { 
    getBuyerPaymentConfirmation, 
    getAdminPaymentNotification 
  } = await import('./whatsapp-templates')

  // Get order details for admin notification
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userName: true },
  })

  // Send email (optional)
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

  // Send WhatsApp to Buyer
  if (data.customerPhone) {
    await sendWhatsApp({
      to: data.customerPhone,
      message: getBuyerPaymentConfirmation({
        orderNumber: data.orderNumber,
        customerName: order?.userName || 'Customer',
        amount: data.amount,
        receiptNumber: data.receiptNumber,
      }),
      orderId,
      type: 'PAYMENT_RECEIVED',
      metadata: {
        orderNumber: data.orderNumber,
        receiptNumber: data.receiptNumber,
        recipient: 'buyer',
      },
    }).catch(err => console.error('WhatsApp to buyer failed:', err))
  }

  // Send WhatsApp to Admin
  if (WHATSAPP_CONFIG.ADMIN_PHONE) {
    await sendWhatsApp({
      to: WHATSAPP_CONFIG.ADMIN_PHONE,
      message: getAdminPaymentNotification({
        orderNumber: data.orderNumber,
        customerName: order?.userName || 'Customer',
        amount: data.amount,
        receiptNumber: data.receiptNumber,
      }),
      orderId,
      type: 'PAYMENT_RECEIVED',
      metadata: {
        orderNumber: data.orderNumber,
        receiptNumber: data.receiptNumber,
        recipient: 'admin',
      },
    }).catch(err => console.error('WhatsApp to admin failed:', err))
  }
}

/**
 * Send order shipped notifications
 * Sends WhatsApp to: Buyer
 */
export async function sendOrderShippedNotification(
  orderId: string,
  data: OrderNotificationData
): Promise<void> {
  const template = getNotificationTemplate('ORDER_SHIPPED', data)
  const { getBuyerOrderShippedNotification } = await import('./whatsapp-templates')

  // Send email (optional)
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

  // Send WhatsApp to Buyer
  if (data.customerPhone) {
    await sendWhatsApp({
      to: data.customerPhone,
      message: getBuyerOrderShippedNotification({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        total: data.total,
        items: data.items,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        trackingNumber: data.trackingNumber,
      }),
      orderId,
      type: 'ORDER_SHIPPED',
      metadata: {
        orderNumber: data.orderNumber,
        trackingNumber: data.trackingNumber,
        recipient: 'buyer',
      },
    }).catch(err => console.error('WhatsApp to buyer failed:', err))
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

