// Import MPESA_CONFIG after ensuring env vars are loaded
// Note: In Next.js, env vars are loaded automatically, but for standalone scripts
// we need to ensure they're loaded first
import { MPESA_CONFIG } from '@/utils/constants'

// Helper to get trimmed credentials
function getTrimmedCredentials() {
  return {
    consumerKey: MPESA_CONFIG.CONSUMER_KEY.trim(),
    consumerSecret: MPESA_CONFIG.CONSUMER_SECRET.trim(),
  }
}
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

  // Get trimmed credentials
  const { consumerKey, consumerSecret } = getTrimmedCredentials()
  
  // Validate credentials are not empty
  if (!consumerKey || !consumerSecret) {
    console.error('Mpesa credentials validation failed:', {
      hasConsumerKey: !!consumerKey,
      hasConsumerSecret: !!consumerSecret,
      environment: MPESA_CONFIG.ENVIRONMENT,
    })
    throw new Error('Mpesa credentials are missing. Please check your .env.local file.')
  }
  
  const credentials = Buffer.from(
    `${consumerKey}:${consumerSecret}`
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
      console.error('Mpesa auth error response:', errorText)
      console.error('Status:', response.status, response.statusText)
      throw new Error(`Mpesa auth failed: ${errorText || response.statusText}`)
    }

    const data = await response.json()
    if (!data.access_token) {
      throw new Error('No access token in response')
    }
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

  // Validate required config
  if (!MPESA_CONFIG.SHORTCODE || !MPESA_CONFIG.PASSKEY || !MPESA_CONFIG.CALLBACK_URL) {
    console.error('Missing Mpesa configuration:', {
      hasShortcode: !!MPESA_CONFIG.SHORTCODE,
      hasPasskey: !!MPESA_CONFIG.PASSKEY,
      hasCallbackUrl: !!MPESA_CONFIG.CALLBACK_URL,
    })
    throw new Error('Mpesa configuration is incomplete. Please check your environment variables.')
  }

  // Warn about placeholder callback URL
  if (MPESA_CONFIG.CALLBACK_URL.includes('yourdomain.com') || MPESA_CONFIG.CALLBACK_URL.includes('localhost')) {
    console.warn('⚠️  WARNING: Callback URL appears to be a placeholder or localhost.')
    console.warn('   For sandbox testing, use ngrok to expose your localhost.')
    console.warn('   Current callback URL:', MPESA_CONFIG.CALLBACK_URL)
  }

  // Warn about sandbox phone numbers
  if (MPESA_CONFIG.ENVIRONMENT === 'sandbox') {
    console.warn('⚠️  SANDBOX MODE: You must use a test phone number from the Mpesa Developer Portal.')
    console.warn('   Test numbers usually start with 254708...')
    console.warn('   Real phone numbers will NOT receive STK push in sandbox mode.')
    console.warn('   Phone being used:', formattedPhone)
  }

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
    console.log('Initiating STK Push with:', {
      phone: formattedPhone,
      amount: Math.round(amount),
      shortcode: MPESA_CONFIG.SHORTCODE,
      environment: MPESA_CONFIG.ENVIRONMENT,
      callbackUrl: MPESA_CONFIG.CALLBACK_URL,
    })

    const response = await fetch(stkPushUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    console.log('STK Push response status:', response.status)
    console.log('STK Push response body:', responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse STK Push response as JSON:', responseText)
      throw new Error(`Invalid response from Mpesa API: ${responseText.substring(0, 200)}`)
    }

    if (!response.ok) {
      console.error('STK Push HTTP error:', {
        status: response.status,
        statusText: response.statusText,
        data,
      })
      throw new Error(
        data.errorMessage || data.ResponseDescription || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    if (data.ResponseCode !== '0') {
      console.error('STK Push API error:', {
        ResponseCode: data.ResponseCode,
        ResponseDescription: data.ResponseDescription,
        errorMessage: data.errorMessage,
      })
      throw new Error(
        data.errorMessage || data.ResponseDescription || `Mpesa API Error: ResponseCode ${data.ResponseCode}`
      )
    }

    console.log('STK Push initiated successfully:', {
      CheckoutRequestID: data.CheckoutRequestID,
      CustomerMessage: data.CustomerMessage,
    })

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

