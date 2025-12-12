import { NotificationType } from '@/generated/prisma'

interface OrderData {
  orderNumber: string
  customerName: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  deliveryAddress: string
  deliveryCity: string
  estimatedDelivery?: string
  trackingNumber?: string
}

interface PaymentData {
  orderNumber: string
  amount: number
  receiptNumber?: string
  transactionId?: string
}

/**
 * Generate email HTML template for order confirmation
 */
export function getOrderConfirmationEmail(data: OrderData): { subject: string; html: string; text: string } {
  const itemsList = data.items
    .map((item) => `- ${item.name} x${item.quantity} - KES ${item.price.toLocaleString()}`)
    .join('\n')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 24px; font-weight: bold; color: #667eea; margin-top: 20px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase, ${data.customerName}!</p>
          </div>
          <div class="content">
            <h2>Order #${data.orderNumber}</h2>
            <div class="order-info">
              <h3>Order Items:</h3>
              ${data.items
                .map(
                  (item) => `
                <div class="item">
                  <strong>${item.name}</strong><br>
                  Quantity: ${item.quantity} × KES ${item.price.toLocaleString()}
                </div>
              `
                )
                .join('')}
              <div class="total">Total: KES ${data.total.toLocaleString()}</div>
            </div>
            <div class="order-info">
              <h3>Delivery Information:</h3>
              <p><strong>Address:</strong> ${data.deliveryAddress}</p>
              <p><strong>City:</strong> ${data.deliveryCity}</p>
            </div>
            <p>We're processing your order and will notify you once it's shipped.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" class="button">View Order</a>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Order Confirmation - Order #${data.orderNumber}

Thank you for your purchase, ${data.customerName}!

Order Items:
${itemsList}

Total: KES ${data.total.toLocaleString()}

Delivery Information:
Address: ${data.deliveryAddress}
City: ${data.deliveryCity}

We're processing your order and will notify you once it's shipped.

View your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}
  `.trim()

  return {
    subject: `Order Confirmation - #${data.orderNumber}`,
    html,
    text,
  }
}

/**
 * Generate SMS text for order confirmation
 */
export function getOrderConfirmationSMS(data: OrderData): string {
  return `Order #${data.orderNumber} confirmed! Total: KES ${data.total.toLocaleString()}. We'll notify you when it ships. Track: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}`
}

/**
 * Generate email HTML template for payment received
 */
export function getPaymentReceivedEmail(data: PaymentData): { subject: string; html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .payment-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #10b981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Received!</h1>
          </div>
          <div class="content">
            <h2>Payment Confirmation for Order #${data.orderNumber}</h2>
            <div class="payment-info">
              <div class="amount">KES ${data.amount.toLocaleString()}</div>
              ${data.receiptNumber ? `<p><strong>Mpesa Receipt:</strong> ${data.receiptNumber}</p>` : ''}
              ${data.transactionId ? `<p><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
            </div>
            <p>Your payment has been successfully received. We're now processing your order.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" class="button" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Order</a>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Payment Received - Order #${data.orderNumber}

Amount: KES ${data.amount.toLocaleString()}
${data.receiptNumber ? `Mpesa Receipt: ${data.receiptNumber}` : ''}
${data.transactionId ? `Transaction ID: ${data.transactionId}` : ''}

Your payment has been successfully received. We're now processing your order.

View order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}
  `.trim()

  return {
    subject: `Payment Received - Order #${data.orderNumber}`,
    html,
    text,
  }
}

/**
 * Generate SMS text for payment received
 */
export function getPaymentReceivedSMS(data: PaymentData): string {
  return `Payment of KES ${data.amount.toLocaleString()} received for Order #${data.orderNumber}${data.receiptNumber ? `. Receipt: ${data.receiptNumber}` : ''}. Your order is being processed.`
}

/**
 * Generate email HTML template for order shipped
 */
export function getOrderShippedEmail(data: OrderData): { subject: string; html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; font-size: 18px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Your Order Has Shipped!</h1>
          </div>
          <div class="content">
            <h2>Order #${data.orderNumber}</h2>
            ${data.trackingNumber ? `<div class="tracking"><strong>Tracking Number:</strong><br>${data.trackingNumber}</div>` : ''}
            ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
            <p>Your order is on its way! You can track it using the tracking number above.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" class="button" style="display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Track Order</a>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Your Order Has Shipped - Order #${data.orderNumber}

${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}` : ''}
${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}` : ''}

Your order is on its way! Track it here: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}
  `.trim()

  return {
    subject: `Your Order Has Shipped - #${data.orderNumber}`,
    html,
    text,
  }
}

/**
 * Generate SMS text for order shipped
 */
export function getOrderShippedSMS(data: OrderData): string {
  return `Order #${data.orderNumber} has shipped!${data.trackingNumber ? ` Track: ${data.trackingNumber}` : ''}${data.estimatedDelivery ? `. Est. delivery: ${data.estimatedDelivery}` : ''}`
}

/**
 * Get notification template based on type
 */
export function getNotificationTemplate(
  type: NotificationType,
  data: OrderData | PaymentData
): { subject?: string; html?: string; text: string; sms?: string } {
  switch (type) {
    case 'ORDER_CONFIRMATION':
      if ('items' in data) {
        const email = getOrderConfirmationEmail(data)
        return {
          ...email,
          sms: getOrderConfirmationSMS(data),
        }
      }
      break

    case 'PAYMENT_RECEIVED':
      if ('amount' in data) {
        const email = getPaymentReceivedEmail(data)
        return {
          ...email,
          sms: getPaymentReceivedSMS(data),
        }
      }
      break

    case 'ORDER_SHIPPED':
      if ('items' in data) {
        const email = getOrderShippedEmail(data)
        return {
          ...email,
          sms: getOrderShippedSMS(data),
        }
      }
      break

    default:
      return {
        text: 'Notification',
        sms: 'Notification',
      }
  }

  return { text: 'Notification', sms: 'Notification' }
}

