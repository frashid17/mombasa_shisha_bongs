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
    if (!EMAIL_CONFIG.GMAIL_USER || !EMAIL_CONFIG.GMAIL_APP_PASSWORD) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email (Development Mode - No Gmail Credentials):')
        console.log('To:', to)
        console.log('Subject:', subject)
        console.log('Body:', text || html)
        console.log('---')
      }

      // Mark as sent in development
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      })

      return { success: true, notificationId: notification.id }
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_CONFIG.GMAIL_USER,
        pass: EMAIL_CONFIG.GMAIL_APP_PASSWORD,
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

