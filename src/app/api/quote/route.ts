import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/notifications/email'
import { NotificationType } from '@/generated/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, description } = body

    // Validate required fields
    if (!name || !email || !phone || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Prepare email content
    const adminEmail = process.env.ADMIN_EMAIL || 'mombasashishabongs@gmail.com'
    const subject = `New Wholesale Quote Request from ${name}`
    
    // Escape HTML to prevent XSS
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safePhone = escapeHtml(phone)
    const safeDescription = escapeHtml(description)
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #dc2626; margin-bottom: 5px; }
            .value { background-color: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Wholesale Quote Request</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${safeName}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${safeEmail}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${safePhone}</div>
              </div>
              <div class="field">
                <div class="label">Request Details:</div>
                <div class="value">${safeDescription}</div>
              </div>
            </div>
            <div class="footer">
              <p>This quote request was submitted from the Mombasa Shisha Bongs website.</p>
              <p>Please respond to the customer at: <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
New Wholesale Quote Request

Name: ${name}
Email: ${email}
Phone: ${phone}

Request Details:
${description}

---
This quote request was submitted from the Mombasa Shisha Bongs website.
Please respond to the customer at: ${email}
    `.trim()

    // Use ADMIN_ALERT as fallback if QUOTE_REQUEST doesn't exist in the database yet
    // The schema has QUOTE_REQUEST, but the database enum might not be updated yet
    // After running `npx prisma db push` and `npx prisma generate`, this will use QUOTE_REQUEST
    const notificationType: NotificationType = NotificationType.ADMIN_ALERT

    // Send email to admin
    const emailResult = await sendEmail({
      to: adminEmail,
      subject,
      html,
      text,
      type: notificationType,
      metadata: {
        name,
        email,
        phone,
        description,
      },
    })

    if (!emailResult.success) {
      console.error('Failed to send quote request email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send quote request. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Quote request sent successfully',
    })
  } catch (error: any) {
    console.error('Error processing quote request:', error)
    const errorMessage = error?.message || 'An error occurred while processing your request'
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { details: error?.stack })
      },
      { status: 500 }
    )
  }
}

