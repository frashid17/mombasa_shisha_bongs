import { EMAIL_CONFIG } from '@/utils/constants'
import prisma from '@/lib/prisma'
import { NotificationType, NotificationChannel, NotificationStatus } from '@/generated/prisma'
import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  orderId?: string
  type: NotificationType
  metadata?: Record<string, any>
}

/**
 * Send email notification using Gmail SMTP
 * Falls back to console.log in development if credentials are not set
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  orderId,
  type,
  metadata,
}: SendEmailOptions): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  // Create notification record first
  const notification = await prisma.notification.create({
    data: {
      orderId: orderId || null,
      recipientEmail: to,
      type,
      channel: NotificationChannel.EMAIL,
      subject,
      message: text || html,
      status: NotificationStatus.PENDING,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })

  try {
    // If no Gmail credentials, log in development mode
    // Note: Default credentials are set in constants, so this check is mainly for custom overrides
    const gmailUser = EMAIL_CONFIG.GMAIL_USER || process.env.GMAIL_USER
    const gmailPassword = EMAIL_CONFIG.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD
    
    if (!gmailUser || !gmailPassword) {
      const errorMsg = 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables. See PRODUCTION-EMAIL-SETUP.md for setup instructions.'
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email (Development Mode - No Gmail Credentials):')
        console.log('To:', to)
        console.log('Subject:', subject)
        console.log('Body:', text || html)
        console.log('---')
        console.warn('⚠️', errorMsg)
      } else {
        // In production, log detailed error
        console.error('❌ EMAIL SENDING FAILED - Gmail credentials missing')
        console.error('   Error:', errorMsg)
        console.error('   GMAIL_USER:', gmailUser ? 'Set' : '❌ NOT SET')
        console.error('   GMAIL_APP_PASSWORD:', gmailPassword ? 'Set' : '❌ NOT SET')
        console.error('   Recipient:', to)
        console.error('   Subject:', subject)
        console.error('   Notification ID:', notification.id)
        console.error('   ---')
        console.error('   ACTION REQUIRED: Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables')
        console.error('   See PRODUCTION-EMAIL-SETUP.md for setup instructions')
      }

      // Mark as failed if in production, sent if in development
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: process.env.NODE_ENV === 'development' ? NotificationStatus.SENT : NotificationStatus.FAILED,
          sentAt: process.env.NODE_ENV === 'development' ? new Date() : null,
          errorMessage: errorMsg, // Always include error message for visibility
        },
      })

      return { 
        success: process.env.NODE_ENV === 'development', 
        notificationId: notification.id,
        error: errorMsg
      }
    }

    // Create Gmail SMTP transporter with specific settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS (port 587), not SSL (port 465)
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
      tls: {
        // Do not fail on invalid certs (useful for development)
        rejectUnauthorized: false,
      },
    })

    // Send email via Gmail SMTP
    const mailOptions = {
      from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.GMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version if not provided
    }

    const info = await transporter.sendMail(mailOptions)

    // Update notification as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        metadata: JSON.stringify({ ...metadata, messageId: info.messageId }),
      },
    })

    return { success: true, notificationId: notification.id }
  } catch (error: any) {
    // Update notification as failed
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.FAILED,
        errorMessage: error.message || 'Unknown error',
      },
    })

    console.error('Email sending error:', error)
    return { success: false, notificationId: notification.id, error: error.message }
  }
}

