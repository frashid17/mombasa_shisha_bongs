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
 * Send WhatsApp message using 360dialog WhatsApp Business API
 * 
 * 360dialog: https://www.360dialog.com/
 * - WhatsApp Business API provider
 * - Easy setup with QR code scanning
 * - Good pricing and reliability
 * - Supports Kenya
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
    if (!WHATSAPP_CONFIG.API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.log('💬 WhatsApp (Development Mode - No 360dialog Credentials):')
        console.log('To:', to)
        console.log('Message:', message)
        console.log('---')
        console.log('💡 To enable WhatsApp:')
        console.log('   1. Sign up at https://www.360dialog.com/')
        console.log('   2. Connect your WhatsApp Business number')
        console.log('   3. Get your API key from dashboard')
        console.log('   4. Add WHATSAPP_API_KEY=your_api_key to .env.local')
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

    // Format phone number for 360dialog (remove + and whatsapp: prefix, keep country code)
    // Input can be: +254712345678, whatsapp:+254712345678, or 254712345678
    // Output should be: 254712345678 (no +, no whatsapp: prefix)
    let phoneNumber = to.replace(/^whatsapp:/, '').replace(/^\+/, '')
    
    // Ensure it starts with country code (Kenya is 254)
    if (!phoneNumber.startsWith('254')) {
      // If it starts with 0, replace with 254
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '254' + phoneNumber.substring(1)
      } else {
        // Assume it's missing country code, add 254
        phoneNumber = '254' + phoneNumber
      }
    }
    
    // Build API URL
    const apiUrl = WHATSAPP_CONFIG.INSTANCE_ID
      ? `${WHATSAPP_CONFIG.API_URL}/instances/${WHATSAPP_CONFIG.INSTANCE_ID}/messages`
      : `${WHATSAPP_CONFIG.API_URL}/messages`
    
    // Use 360dialog WhatsApp Business API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': WHATSAPP_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        to: phoneNumber,
        type: 'text',
        text: {
          body: message,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      let errorMessage = data.error?.message || data.message || `360dialog WhatsApp error: ${response.status}`
      
      // Provide helpful error messages
      if (response.status === 401) {
        errorMessage = '360dialog Error 401: Invalid API key. Check your WHATSAPP_API_KEY in .env.local'
      } else if (response.status === 400) {
        errorMessage = `360dialog Error 400: Invalid request. ${data.error?.message || 'Check phone number format (should be: 254712345678)'}`
      } else if (response.status === 404) {
        errorMessage = '360dialog Error 404: Instance ID not found. Check your WHATSAPP_INSTANCE_ID in .env.local or remove it if not needed'
      }
      
      throw new Error(errorMessage)
    }

    // Update notification as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        metadata: JSON.stringify({ 
          ...metadata, 
          messageId: data.messages?.[0]?.id || data.id,
          status: data.messages?.[0]?.status || 'sent',
          provider: '360dialog',
        }),
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

