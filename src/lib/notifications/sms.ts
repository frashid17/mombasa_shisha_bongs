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
      // Provide helpful error messages for common Twilio errors
      let errorMessage = data.message || `Twilio error: ${data.code || 'Unknown error'}`
      
      if (data.code === 21612) {
        errorMessage = `Twilio Error 21612: Cannot send to unverified number. Trial accounts can only send to verified numbers. Go to Twilio Console → Phone Numbers → Verified Caller IDs to verify your number.`
      } else if (data.code === 21211) {
        errorMessage = `Twilio Error 21211: Invalid 'To' phone number. Make sure it's in E.164 format (e.g., +254712345678)`
      } else if (data.code === 21212) {
        errorMessage = `Twilio Error 21212: Invalid 'From' phone number. Check your TWILIO_PHONE_NUMBER in .env.local`
      }
      
      throw new Error(errorMessage)
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
 * Send WhatsApp message using Twilio WhatsApp API
 * 
 * Twilio WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
 * - Free for testing
 * - Send to any number after joining sandbox
 * - For production, need WhatsApp Business API approval
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
    const { WHATSAPP_CONFIG } = await import('@/utils/constants')
    
    // If no credentials, log in development mode
    if (!WHATSAPP_CONFIG.ACCOUNT_SID || !WHATSAPP_CONFIG.AUTH_TOKEN || !WHATSAPP_CONFIG.FROM_NUMBER) {
      if (process.env.NODE_ENV === 'development') {
        console.log('💬 WhatsApp (Development Mode - No Twilio Credentials):')
        console.log('To:', to)
        console.log('Message:', message)
        console.log('---')
        console.log('💡 To enable WhatsApp:')
        console.log('   1. Get Twilio WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn')
        console.log('   2. Join sandbox by sending "join <code>" to +1 415 523 8886')
        console.log('   3. Add TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886 to .env.local')
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

    // Format phone number for WhatsApp (add whatsapp: prefix if not present)
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    
    // Use Twilio WhatsApp Cloud API (not MM Lite - supports transactional messages)
    // For sandbox: Use whatsapp:+14155238886
    // For production: Use your approved WhatsApp Business number
    const auth = Buffer.from(`${WHATSAPP_CONFIG.ACCOUNT_SID}:${WHATSAPP_CONFIG.AUTH_TOKEN}`).toString('base64')
    
    // Use the Messages API endpoint (Cloud API) - supports transactional messages
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${WHATSAPP_CONFIG.ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: new URLSearchParams({
          From: WHATSAPP_CONFIG.FROM_NUMBER,
          To: whatsappTo,
          Body: message,
          // Important: Don't use ContentSid or ContentVariables (those are for MM Lite)
          // Just use Body for transactional messages
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      let errorMessage = data.message || `Twilio WhatsApp error: ${data.code || 'Unknown error'}`
      
      if (data.code === 21612) {
        errorMessage = `Twilio Error 21612: Cannot send to unverified number. For sandbox, send "join <code>" to +1 415 523 8886 first.`
      } else if (data.code === 21211) {
        errorMessage = `Twilio Error 21211: Invalid 'To' phone number. Format: whatsapp:+254712345678`
      }
      
      throw new Error(errorMessage)
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

    console.error('WhatsApp sending error:', error)
    return { success: false, notificationId: notification.id, error: error.message }
  }
}

