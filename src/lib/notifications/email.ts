import { EMAIL_CONFIG } from '@/utils/constants'
import prisma from '@/lib/prisma'
import { NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client'

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
 * Send email notification using Resend API
 * Falls back to console.log in development if API key is not set
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
    // If no API key, log in development mode
    if (!EMAIL_CONFIG.API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email (Development Mode - No API Key):')
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

    // Use Resend API for production
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EMAIL_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_ADDRESS}>`,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    // Update notification as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        metadata: JSON.stringify({ ...metadata, resendId: data.id }),
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

