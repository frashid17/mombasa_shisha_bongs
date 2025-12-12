/**
 * WhatsApp Message Templates
 * 
 * These templates are optimized for WhatsApp (shorter, emoji-friendly)
 */

interface OrderData {
  orderNumber: string
  customerName: string
  customerPhone: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  deliveryAddress: string
  deliveryCity: string
}

interface PaymentData {
  orderNumber: string
  customerName: string
  amount: number
  receiptNumber?: string
}

/**
 * WhatsApp message for delivery person when order is placed
 */
export function getDeliveryPersonOrderNotification(data: OrderData): string {
  const itemsList = data.items
    .map((item) => `• ${item.name} (x${item.quantity})`)
    .join('\n')

  return `🚚 *NEW ORDER - Ready for Delivery*

📦 *Order #${data.orderNumber}*

👤 *Customer:* ${data.customerName}
📞 *Phone:* ${data.customerPhone}
📍 *Address:* ${data.deliveryAddress}, ${data.deliveryCity}

🛍️ *Items:*
${itemsList}

💰 *Total:* KES ${data.total.toLocaleString()}

Please prepare for delivery! 🚀`
}

/**
 * WhatsApp message for buyer when payment is received
 */
export function getBuyerPaymentConfirmation(data: PaymentData): string {
  return `✅ *Payment Confirmed!*

🎉 Thank you ${data.customerName}!

📦 *Order #${data.orderNumber}*
💰 *Amount Paid:* KES ${data.amount.toLocaleString()}
${data.receiptNumber ? `🧾 *Receipt:* ${data.receiptNumber}` : ''}

Your order is now being processed and will be delivered soon! 🚀

We'll notify you when your order is on the way. 📱`
}

/**
 * WhatsApp message for admin when order is placed
 */
export function getAdminOrderNotification(data: OrderData): string {
  const itemsList = data.items
    .map((item) => `• ${item.name} (x${item.quantity}) - KES ${item.price.toLocaleString()}`)
    .join('\n')

  return `📢 *NEW ORDER RECEIVED*

📦 *Order #${data.orderNumber}*

👤 *Customer Details:*
Name: ${data.customerName}
Phone: ${data.customerPhone}
Address: ${data.deliveryAddress}, ${data.deliveryCity}

🛍️ *Order Items:*
${itemsList}

💰 *Total Amount:* KES ${data.total.toLocaleString()}

⚠️ *Action Required:* Process order and notify delivery person.`
}

/**
 * WhatsApp message for admin when payment is received
 */
export function getAdminPaymentNotification(data: PaymentData): string {
  return `💰 *PAYMENT RECEIVED*

✅ *Order #${data.orderNumber}*

👤 *Customer:* ${data.customerName}
💵 *Amount:* KES ${data.amount.toLocaleString()}
${data.receiptNumber ? `🧾 *Mpesa Receipt:* ${data.receiptNumber}` : ''}

✅ Payment confirmed! Order can now be processed.`
}

/**
 * WhatsApp message for buyer when order is shipped
 */
export function getBuyerOrderShippedNotification(data: OrderData & { trackingNumber?: string }): string {
  return `🚚 *Your Order is on the Way!*

📦 *Order #${data.orderNumber}*

Your order has been dispatched and is on its way to you! 🎉

${data.trackingNumber ? `📋 *Tracking Number:* ${data.trackingNumber}` : ''}
📍 *Delivery Address:* ${data.deliveryAddress}, ${data.deliveryCity}

You'll receive another notification when it's delivered! 📱`
}

