import { MPESA_CONFIG } from '@/utils/constants'
import crypto from 'crypto'

/**
 * Generate Mpesa OAuth Access Token
 */
export async function getMpesaAccessToken(): Promise<string> {
  const baseUrl =
    MPESA_CONFIG.ENVIRONMENT === 'production'
      ? MPESA_CONFIG.PRODUCTION_URL
      : MPESA_CONFIG.SANDBOX_URL

  const authUrl = `${baseUrl}${MPESA_CONFIG.AUTH_URL}`

  const credentials = Buffer.from(
    `${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`
  ).toString('base64')

  try {
    const response = await fetch(authUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Mpesa auth failed: ${errorText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error: any) {
    console.error('Error getting Mpesa access token:', error)
    throw new Error(`Failed to get Mpesa access token: ${error.message}`)
  }
}

/**
 * Generate Mpesa password (Base64 encoded timestamp + passkey)
 */
export function generateMpesaPassword(shortcode: string, passkey: string): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3) // Format: YYYYMMDDHHmmss

  const passwordString = `${shortcode}${passkey}${timestamp}`
  return Buffer.from(passwordString).toString('base64')
}

/**
 * Generate Mpesa timestamp
 */
export function generateMpesaTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3) // Format: YYYYMMDDHHmmss
}

/**
 * Format phone number for Mpesa (254XXXXXXXXX)
 */
export function formatMpesaPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')

  // Handle different formats
  if (cleaned.startsWith('0')) {
    // Convert 07XX to 2547XX
    cleaned = '254' + cleaned.substring(1)
  } else if (cleaned.startsWith('254')) {
    // Already in correct format
    cleaned = cleaned
  } else if (cleaned.length === 9) {
    // Assume it's missing the 254 prefix
    cleaned = '254' + cleaned
  }

  return cleaned
}

/**
 * Initiate Mpesa STK Push
 */
export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<{
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}> {
  const accessToken = await getMpesaAccessToken()
  const baseUrl =
    MPESA_CONFIG.ENVIRONMENT === 'production'
      ? MPESA_CONFIG.PRODUCTION_URL
      : MPESA_CONFIG.SANDBOX_URL

  const stkPushUrl = `${baseUrl}${MPESA_CONFIG.STK_PUSH_URL}`
  const timestamp = generateMpesaTimestamp()
  const password = generateMpesaPassword(MPESA_CONFIG.SHORTCODE, MPESA_CONFIG.PASSKEY)
  const formattedPhone = formatMpesaPhoneNumber(phoneNumber)

  const requestBody = {
    BusinessShortCode: MPESA_CONFIG.SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount), // Mpesa requires integer amount
    PartyA: formattedPhone,
    PartyB: MPESA_CONFIG.SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: MPESA_CONFIG.CALLBACK_URL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  }

  try {
    const response = await fetch(stkPushUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok || data.ResponseCode !== '0') {
      throw new Error(
        data.errorMessage || data.ResponseDescription || 'Failed to initiate STK Push'
      )
    }

    return {
      CheckoutRequestID: data.CheckoutRequestID,
      ResponseCode: data.ResponseCode,
      ResponseDescription: data.ResponseDescription,
      CustomerMessage: data.CustomerMessage,
    }
  } catch (error: any) {
    console.error('Error initiating STK Push:', error)
    throw new Error(`Failed to initiate STK Push: ${error.message}`)
  }
}

/**
 * Query STK Push status
 */
export async function querySTKPushStatus(checkoutRequestId: string): Promise<any> {
  const accessToken = await getMpesaAccessToken()
  const baseUrl =
    MPESA_CONFIG.ENVIRONMENT === 'production'
      ? MPESA_CONFIG.PRODUCTION_URL
      : MPESA_CONFIG.SANDBOX_URL

  const queryUrl = `${baseUrl}${MPESA_CONFIG.QUERY_URL}`
  const timestamp = generateMpesaTimestamp()
  const password = generateMpesaPassword(MPESA_CONFIG.SHORTCODE, MPESA_CONFIG.PASSKEY)

  const requestBody = {
    BusinessShortCode: MPESA_CONFIG.SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  }

  try {
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Error querying STK Push status:', error)
    throw new Error(`Failed to query STK Push status: ${error.message}`)
  }
}

