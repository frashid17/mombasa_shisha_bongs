import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail } from '@/lib/notifications/email'
import { ADMIN_CONFIG } from '@/utils/constants'

const submitPaymentSchema = z.object({
  orderId: z.string().min(1),
  referenceNumber: z.string().min(6).max(20),
  senderName: z.string().min(2).max(100),
})

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    const body = await req.json()
    const validated = submitPaymentSchema.parse(body)

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: {
        items: true,
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user owns this order (allow guest orders)
    if (order.userId !== userId && order.userId !== 'guest' && userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if payment already exists and is paid
    if (order.payment && order.payment.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Payment already completed' },
        { status: 400 }
      )
    }

    // Check if reference number already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        mpesaReceiptNumber: validated.referenceNumber,
        orderId: { not: validated.orderId },
      },
    })

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'This reference number has already been used for another order' },
        { status: 400 }
      )
    }

    // Create or update payment record
    const payment = order.payment
      ? await prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            mpesaReceiptNumber: validated.referenceNumber,
            mpesaSenderName: validated.senderName,
            status: 'PENDING',
          },
        })
      : await prisma.payment.create({
          data: {
            orderId: order.id,
            method: 'MPESA',
            amount: order.total,
            currency: 'KES',
            status: 'PENDING',
            mpesaReceiptNumber: validated.referenceNumber,
            mpesaSenderName: validated.senderName,
          },
        })

    // Update order payment status
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PENDING' },
    })

    // Send email to admin
    const adminEmail = ADMIN_CONFIG.EMAIL
    if (adminEmail) {
      const emailSubject = `💰 New Payment Submitted - Order #${order.orderNumber}`
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .section { background: white; padding: 15px; margin-bottom: 15px; border-radius: 5px; border-left: 4px solid #dc2626; }
            .section h2 { margin-top: 0; color: #dc2626; font-size: 18px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #555; }
            .info-value { color: #333; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .highlight { background: #fef2f2; padding: 15px; border-radius: 5px; border: 2px solid #dc2626; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 New Payment Submitted</h1>
              <p style="margin: 0; font-size: 18px;">Order #${order.orderNumber}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h2>📦 Order Information</h2>
                <div class="info-row">
                  <span class="info-label">Order Number:</span>
                  <span class="info-value">#${order.orderNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Customer:</span>
                  <span class="info-value">${order.userName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Customer Email:</span>
                  <span class="info-value">${order.userEmail}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Customer Phone:</span>
                  <span class="info-value">${order.userPhone || 'Not provided'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Order Total:</span>
                  <span class="info-value" style="font-weight: bold; font-size: 16px;">KES ${Number(order.total).toLocaleString()}</span>
                </div>
              </div>

              <div class="section">
                <h2>🛍️ Order Items</h2>
                <div style="display: grid; gap: 10px; margin-top: 10px;">
                  ${order.items.map(item => `
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; display: flex; gap: 12px; align-items: center;">
                      ${item.productImage ? `
                        <img src="${item.productImage.startsWith('http') ? item.productImage : (process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com') + item.productImage}" alt="${item.productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; flex-shrink: 0;">
                      ` : `
                        <div style="width: 60px; height: 60px; background: #e5e7eb; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 10px;">No Image</div>
                      `}
                      <div style="flex: 1; min-width: 0;">
                        <h3 style="margin: 0 0 6px 0; color: #1f2937; font-size: 14px; font-weight: bold;">${item.productName}</h3>
                        <div style="display: flex; gap: 15px; font-size: 13px; color: #6b7280;">
                          <span><strong>Qty:</strong> ${item.quantity}</span>
                          <span><strong>Price:</strong> KES ${Number(item.price).toLocaleString()}</span>
                          <span><strong>Subtotal:</strong> KES ${(Number(item.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb; text-align: right;">
                  <div style="font-size: 18px; font-weight: bold; color: #1f2937;">
                    Total: <span style="color: #dc2626;">KES ${Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>💳 Payment Details</h2>
                <div class="highlight">
                  <div class="info-row">
                    <span class="info-label">M-Pesa Reference Number:</span>
                    <span class="info-value" style="font-weight: bold; font-size: 16px; color: #dc2626;">${validated.referenceNumber}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Sender Name:</span>
                    <span class="info-value" style="font-weight: bold;">${validated.senderName}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Amount Expected:</span>
                    <span class="info-value" style="font-weight: bold;">KES ${Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
                <p style="margin-top: 15px; color: #666; font-size: 14px;">
                  <strong>Action Required:</strong> Please verify this payment in your M-Pesa account and approve it in the admin panel.
                </p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'}/admin/payments" class="button">
                  Review Payment in Admin Panel
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml,
        text: `New Payment Submitted\n\nOrder #${order.orderNumber}\nCustomer: ${order.userName}\nEmail: ${order.userEmail}\nPhone: ${order.userPhone || 'Not provided'}\n\nOrder Items:\n${order.items.map(item => `- ${item.productName} x${item.quantity} - KES ${Number(item.price).toLocaleString()} each = KES ${(Number(item.price) * item.quantity).toLocaleString()}`).join('\n')}\n\nTotal: KES ${Number(order.total).toLocaleString()}\n\nPayment Details:\nM-Pesa Reference: ${validated.referenceNumber}\nSender Name: ${validated.senderName}\nAmount Paid: KES ${Number(order.total).toLocaleString()}\n\nPlease verify and approve in admin panel: ${process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'}/admin/payments`,
        orderId: order.id,
        type: 'ADMIN_ALERT',
        metadata: {
          orderNumber: order.orderNumber,
          paymentReference: validated.referenceNumber,
        },
      }).catch(err => {
        console.error('Failed to send admin email:', err)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment details submitted successfully. Admin will verify and approve your payment.',
    })
  } catch (error: any) {
    console.error('Payment submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit payment details' },
      { status: 500 }
    )
  }
}

