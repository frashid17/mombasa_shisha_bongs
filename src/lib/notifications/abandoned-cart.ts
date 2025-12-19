/**
 * Abandoned Cart Recovery Notifications
 * 
 * Sends email reminders to customers who abandoned their carts
 */

import { sendEmail } from './email'

interface AbandonedCartData {
  email: string
  cartItems: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
  }>
  total: number
  reminderNumber: number
}

/**
 * Send abandoned cart reminder email
 */
export async function sendAbandonedCartReminder(
  data: AbandonedCartData
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  const { email, cartItems, total, reminderNumber } = data

  // Calculate item count
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Build subject based on reminder number
  const subjects = {
    1: "Don't forget your items! Complete your purchase",
    2: "Your cart is waiting - Limited time offer!",
    3: "Last chance! Your items are still available",
  }
  const subject = subjects[reminderNumber as keyof typeof subjects] || subjects[1]

  // Build cart items HTML
  const itemsHtml = cartItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 600; color: #111827;">${item.name}</div>
        <div style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <div style="font-weight: 600; color: #111827;">KES ${(item.price * item.quantity).toLocaleString()}</div>
      </td>
    </tr>
  `
    )
    .join('')

  // Build urgency message based on reminder number
  const urgencyMessages = {
    1: "Complete your purchase now and get your items delivered to your door!",
    2: "Don't miss out! Complete your purchase today and enjoy fast delivery.",
    3: "This is your final reminder! Complete your purchase now before items run out.",
  }
  const urgencyMessage = urgencyMessages[reminderNumber as keyof typeof urgencyMessages] || urgencyMessages[1]

  const discountMessage = reminderNumber >= 2 
    ? '<p style="color: #dc2626; font-weight: 600; font-size: 18px; margin: 20px 0;">🎁 Special Offer: Use code <strong>COMEBACK10</strong> for 10% off your order!</p>'
    : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f9fafb; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">You Left Items in Your Cart!</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 20px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi there,
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            We noticed you added ${itemCount} item${itemCount !== 1 ? 's' : ''} to your cart but didn't complete your purchase.
          </p>

          ${discountMessage}

          <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
            ${urgencyMessage}
          </p>

          <!-- Cart Items Table -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 20px;">Your Cart Items:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; font-weight: 600;">Image</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; font-weight: 600;">Item</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600; color: #111827; border-top: 2px solid #e5e7eb;">Total:</td>
                  <td style="padding: 12px; text-align: right; font-weight: 700; font-size: 20px; color: #667eea; border-top: 2px solid #e5e7eb;">KES ${total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Complete Your Purchase →
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
            Questions? Reply to this email or contact us at ${process.env.ADMIN_EMAIL || 'support@mombasashishabongs.com'}
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            © ${new Date().getFullYear()} Mombasa Shisha Bongs. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Don't forget your items! Complete your purchase

Hi there,

We noticed you added ${itemCount} item${itemCount !== 1 ? 's' : ''} to your cart but didn't complete your purchase.

${urgencyMessage}

Your Cart Items:
${cartItems.map((item) => `- ${item.name} x${item.quantity} - KES ${(item.price * item.quantity).toLocaleString()}`).join('\n')}

Total: KES ${total.toLocaleString()}

Complete your purchase: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart

Questions? Contact us at ${process.env.ADMIN_EMAIL || 'support@mombasashishabongs.com'}
  `

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    type: 'ABANDONED_CART_REMINDER',
    metadata: {
      reminderNumber,
      itemCount,
      total,
      cartItemIds: cartItems.map((item) => item.id),
    },
  })
}

