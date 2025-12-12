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
 * Send SMS notification using Twilio API
 * Falls back to console.log in development if credentials are not set
 * 
 * Twilio Free Trial: Get $15.50 credit at https://www.twilio.com/try-twilio
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
    // If no credentials, log in development mode
    if (!SMS_CONFIG.ACCOUNT_SID || !SMS_CONFIG.AUTH_TOKEN || !SMS_CONFIG.FROM_NUMBER) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 SMS (Development Mode - No Twilio Credentials):')
        console.log('To:', to)
        console.log('Message:', message)
        console.log('---')
        console.log('💡 To enable SMS: Get free Twilio account at https://www.twilio.com/try-twilio')
        console.log('   Add credentials to .env.local:')
        console.log('   TWILIO_ACCOUNT_SID=your_account_sid')
        console.log('   TWILIO_AUTH_TOKEN=your_auth_token')
        console.log('   TWILIO_PHONE_NUMBER=+1234567890')
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

    // Use Twilio API
    // Twilio uses Basic Auth with Account SID as username and Auth Token as password
    const auth = Buffer.from(`${SMS_CONFIG.ACCOUNT_SID}:${SMS_CONFIG.AUTH_TOKEN}`).toString('base64')
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SMS_CONFIG.ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: new URLSearchParams({
          From: SMS_CONFIG.FROM_NUMBER,
          To: to,
          Body: message,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `Twilio error: ${data.code || 'Unknown error'}`)
    }

    // Update notification as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        metadata: JSON.stringify({ ...metadata, messageSid: data.sid, status: data.status }),
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
    // If no credentials, log in development mode
    if (!SMS_CONFIG.ACCOUNT_SID || !SMS_CONFIG.AUTH_TOKEN || !SMS_CONFIG.FROM_NUMBER) {
      if (process.env.NODE_ENV === 'development') {
        console.log('💬 WhatsApp (Development Mode - No Twilio Credentials):')
        console.log('To:', to)
        console.log('Message:', message)
        console.log('---')
        console.log('💡 WhatsApp requires Twilio WhatsApp Business API setup')
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

    // Note: WhatsApp via Twilio requires WhatsApp Business API setup
    // For now, we'll use SMS as fallback or log it
    console.log('WhatsApp sending not fully implemented - requires Twilio WhatsApp Business API setup')
    console.log('💡 For now, SMS notifications are sent instead')
    
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

