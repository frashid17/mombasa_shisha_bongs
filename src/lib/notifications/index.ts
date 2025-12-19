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
  paymentMethod?: string
  paymentStatus?: string
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
    // Format payment method for display
    const paymentMethodDisplay = data.paymentMethod === 'CASH_ON_DELIVERY' 
      ? 'Payment on Delivery' 
      : data.paymentMethod === 'MPESA' 
      ? 'M-Pesa' 
      : data.paymentMethod === 'PAYSTACK' 
      ? 'M-Pesa / Paystack' 
      : data.paymentMethod || 'Not specified'
    
    // Format payment status for display
    const paymentStatusDisplay = data.paymentStatus === 'PENDING' 
      ? 'Pending' 
      : data.paymentStatus === 'PAID' 
      ? 'Paid' 
      : data.paymentStatus === 'FAILED' 
      ? 'Failed' 
      : data.paymentStatus || 'Unknown'
    
    // Calculate item totals
    const itemsTotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    const adminTemplate = {
      subject: `🛒 New Order Received - #${data.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .section { background: white; padding: 15px; margin-bottom: 15px; border-radius: 5px; border-left: 4px solid #667eea; }
            .section h2 { margin-top: 0; color: #667eea; font-size: 18px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #555; }
            .info-value { color: #333; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th { background: #667eea; color: white; padding: 10px; text-align: left; }
            .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
            .items-table tr:last-child td { border-bottom: none; }
            .total-row { background: #f0f0f0; font-weight: bold; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .status-pending { background: #ffc107; color: #000; }
            .status-paid { background: #28a745; color: white; }
            .status-failed { background: #dc3545; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 New Order Received</h1>
              <p style="margin: 0; font-size: 18px;">Order #${data.orderNumber}</p>
            </div>
            
            <div class="content">
              <!-- Customer Information -->
              <div class="section">
                <h2>👤 Customer Information</h2>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${data.customerName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${data.customerEmail}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${data.customerPhone}</span>
                </div>
              </div>
              
              <!-- Delivery Information -->
              <div class="section">
                <h2>📍 Delivery Location</h2>
                <div class="info-row">
                  <span class="info-label">Address:</span>
                  <span class="info-value">${data.deliveryAddress}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">City:</span>
                  <span class="info-value">${data.deliveryCity}</span>
                </div>
              </div>
              
              <!-- Payment Information -->
              <div class="section">
                <h2>💳 Payment Information</h2>
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${paymentMethodDisplay}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Status:</span>
                  <span class="info-value">
                    <span class="status-badge status-${data.paymentStatus?.toLowerCase() || 'pending'}">${paymentStatusDisplay}</span>
                  </span>
                </div>
              </div>
              
              <!-- Order Items -->
              <div class="section">
                <h2>📦 Order Items</h2>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>KES ${item.price.toLocaleString()}</td>
                        <td>KES ${(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    `).join('')}
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                      <td><strong>KES ${data.total.toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Action Button -->
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'}/admin/orders/${orderId}" class="button">
                  View Order in Admin Panel
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `New Order Received

Order Number: #${data.orderNumber}

Customer Information:
- Name: ${data.customerName}
- Email: ${data.customerEmail}
- Phone: ${data.customerPhone}

Delivery Location:
- Address: ${data.deliveryAddress}
- City: ${data.deliveryCity}

Payment Information:
- Payment Method: ${paymentMethodDisplay}
- Payment Status: ${paymentStatusDisplay}

Order Items:
${data.items.map(item => `- ${item.name} x${item.quantity} - KES ${item.price.toLocaleString()} each = KES ${(item.price * item.quantity).toLocaleString()}`).join('\n')}

Total: KES ${data.total.toLocaleString()}

View order: ${process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'}/admin/orders/${orderId}`,
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

  // Get order details for admin notification (including delivery address)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { 
      userName: true,
      userEmail: true,
      userPhone: true,
      deliveryAddress: true,
      deliveryCity: true,
      deliveryLatitude: true,
      deliveryLongitude: true,
    },
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
    // Build delivery location info
    const deliveryInfo = []
    if (order?.deliveryAddress) {
      deliveryInfo.push(order.deliveryAddress)
    }
    if (order?.deliveryCity) {
      deliveryInfo.push(order.deliveryCity)
    }
    if (order?.deliveryLatitude && order?.deliveryLongitude) {
      deliveryInfo.push(`Coordinates: ${order.deliveryLatitude}, ${order.deliveryLongitude}`)
      deliveryInfo.push(`<a href="https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}" target="_blank">View on Google Maps</a>`)
    }
    const deliveryLocation = deliveryInfo.length > 0 ? deliveryInfo.join('<br>') : 'Not specified'

    const adminTemplate = {
      subject: `Payment Received - Order #${data.orderNumber}`,
      html: `
        <h1>Payment Received</h1>
        <p><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p><strong>Customer:</strong> ${order?.userName || 'Customer'}</p>
        <p><strong>Customer Email:</strong> ${order?.userEmail || data.customerEmail}</p>
        <p><strong>Customer Phone:</strong> ${order?.userPhone || data.customerPhone || 'Not provided'}</p>
        <p><strong>Amount:</strong> KES ${data.amount.toLocaleString()}</p>
        ${data.receiptNumber ? `<p><strong>Mpesa Receipt:</strong> ${data.receiptNumber}</p>` : ''}
        ${data.transactionId ? `<p><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <h2>Delivery Location</h2>
        <p>${deliveryLocation}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderId}">View Order in Admin Panel</a></p>
      `,
      text: `Payment received for Order #${data.orderNumber}. Amount: KES ${data.amount.toLocaleString()}. ${data.receiptNumber ? `Receipt: ${data.receiptNumber}` : ''}\n\nCustomer: ${order?.userName || 'Customer'}\nEmail: ${order?.userEmail || data.customerEmail}\nPhone: ${order?.userPhone || data.customerPhone || 'Not provided'}\n\nDelivery Location:\n${order?.deliveryAddress || 'Not specified'}${order?.deliveryCity ? `, ${order.deliveryCity}` : ''}${order?.deliveryLatitude && order?.deliveryLongitude ? `\nCoordinates: ${order.deliveryLatitude}, ${order.deliveryLongitude}\nView on Google Maps: https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}` : ''}`,
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

