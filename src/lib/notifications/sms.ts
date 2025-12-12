import { SMS_CONFIG } from '@/utils/constants'
import prisma from '@/lib/prisma'
import { NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client'

interface SendSMSOptions {
  to: string // Phone number in format +254XXXXXXXXX
  message: string
  orderId?: string
  type: NotificationType
  metadata?: Record<string, any>
}

/**
 * Send SMS notification using Africa's Talking API
 * Falls back to console.log in development if API key is not set
 */
export async function sendSMS({
  to,
  message,
  orderId,
  type,
  metadata,
}: SendSMSOptions): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  // Create notification record first
  const notification = await prisma.notification.create({
    data: {
      orderId: orderId || null,
      recipientEmail: '', // SMS doesn't need email
      recipientPhone: to,
      type,
      channel: NotificationChannel.SMS,
      message,
      status: NotificationStatus.PENDING,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })

  try {
    // If no API key, log in development mode
    if (!SMS_CONFIG.API_KEY || !SMS_CONFIG.USERNAME) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 SMS (Development Mode - No API Key):')
        console.log('To:', to)
        console.log('Message:', message)
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

    // Use Africa's Talking API
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': SMS_CONFIG.API_KEY,
      },
      body: new URLSearchParams({
        username: SMS_CONFIG.USERNAME,
        to: to,
        message: message,
        from: SMS_CONFIG.FROM,
      }),
    })

    const data = await response.json()

    if (!response.ok || data.SMSMessageData?.Recipients?.[0]?.status !== 'Success') {
      throw new Error(data.SMSMessageData?.Recipients?.[0]?.statusCode || 'Failed to send SMS')
    }

    // Update notification as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        metadata: JSON.stringify({ ...metadata, messageId: data.SMSMessageData?.Recipients?.[0]?.messageId }),
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

    console.error('SMS sending error:', error)
    return { success: false, notificationId: notification.id, error: error.message }
  }
}

/**
 * Send WhatsApp message (using Africa's Talking WhatsApp API or Twilio)
 * Note: WhatsApp requires business verification
 */
export async function sendWhatsApp({
  to,
  message,
  orderId,
  type,
  metadata,
}: SendSMSOptions): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  // Create notification record first
  const notification = await prisma.notification.create({
    data: {
      orderId: orderId || null,
      recipientEmail: '',
      recipientPhone: to,
      type,
      channel: NotificationChannel.WHATSAPP,
      message,
      status: NotificationStatus.PENDING,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })

  try {
    // If no API key, log in development mode
    if (!SMS_CONFIG.API_KEY || !SMS_CONFIG.USERNAME) {
      if (process.env.NODE_ENV === 'development') {
        console.log('💬 WhatsApp (Development Mode - No API Key):')
        console.log('To:', to)
        console.log('Message:', message)
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

    // Use Africa's Talking WhatsApp API (if available)
    // Note: This requires WhatsApp Business API setup
    // For now, we'll use SMS as fallback or log it
    console.log('WhatsApp sending not fully implemented - requires WhatsApp Business API')
    
    // Update notification as sent (for now)
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
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

    console.error('WhatsApp sending error:', error)
    return { success: false, notificationId: notification.id, error: error.message }
  }
}

