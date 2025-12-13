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

  // Validate callback URL
  if (MPESA_CONFIG.CALLBACK_URL.includes('yourdomain.com') || 
      MPESA_CONFIG.CALLBACK_URL.includes('localhost') ||
      MPESA_CONFIG.CALLBACK_URL.includes('127.0.0.1')) {
    console.error('❌ CRITICAL: Callback URL is not publicly accessible!')
    console.error('   Mpesa cannot send callbacks to localhost.')
    console.error('   Current callback URL:', MPESA_CONFIG.CALLBACK_URL)
    console.error('   Solution: Use ngrok to expose your localhost:')
    console.error('   1. Install ngrok: brew install ngrok')
    console.error('   2. Run: ngrok http 3000')
    console.error('   3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)')
    console.error('   4. Update MPESA_CALLBACK_URL in .env.local')
    console.error('   5. Restart your server')
    throw new Error(
      `Callback URL ${MPESA_CONFIG.CALLBACK_URL} is not publicly accessible. ` +
      `Mpesa requires a publicly accessible URL. Use ngrok for local testing.`
    )
  }
  
  // Validate callback URL is HTTPS (required by Mpesa)
  if (!MPESA_CONFIG.CALLBACK_URL.startsWith('https://')) {
    console.error('❌ CRITICAL: Callback URL must use HTTPS!')
    console.error('   Current callback URL:', MPESA_CONFIG.CALLBACK_URL)
    throw new Error('MPESA_CALLBACK_URL must use HTTPS protocol')
  }

  // Validate and warn about sandbox phone numbers
  if (MPESA_CONFIG.ENVIRONMENT === 'sandbox') {
    // Common sandbox test numbers (from Mpesa documentation)
    const sandboxTestNumbers = [
      '254708374149',
      '254708786000',
      '254708786001',
      '254712345678',
    ]
    
    const isTestNumber = sandboxTestNumbers.includes(formattedPhone) || formattedPhone.startsWith('254708')
    
    if (!isTestNumber) {
      console.error('❌ CRITICAL: You are using a REAL phone number in SANDBOX mode!')
      console.error('   Sandbox mode ONLY works with test phone numbers from Mpesa Developer Portal.')
      console.error('   Your phone number:', formattedPhone)
      console.error('   Test numbers to use:', sandboxTestNumbers.join(', '))
      console.error('   Get test numbers from: https://developer.safaricom.co.ke/')
      throw new Error(
        `Cannot use real phone number ${formattedPhone} in sandbox mode. ` +
        `Please use a test number from Mpesa Developer Portal (e.g., 254708374149).`
      )
    } else {
      console.log('✅ Using sandbox test number:', formattedPhone)
    }
  }

  const requestBody = {
    BusinessShortCode: MPESA_CONFIG.SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: String(Math.round(amount)), // Mpesa requires amount as string
    PartyA: formattedPhone,
    PartyB: MPESA_CONFIG.SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: MPESA_CONFIG.CALLBACK_URL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  }

  try {
    // Validate phone number format
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      throw new Error(
        `Invalid phone number format: ${formattedPhone}. ` +
        `Expected format: 254XXXXXXXXX (12 digits starting with 254)`
      )
    }
    
    // Validate amount (must be positive)
    const roundedAmount = Math.round(amount)
    if (roundedAmount <= 0) {
      throw new Error(`Invalid amount: ${amount}. Amount must be greater than 0`)
    }
    
    // Warn about large amounts in sandbox
    if (MPESA_CONFIG.ENVIRONMENT === 'sandbox' && roundedAmount > 100) {
      console.warn('⚠️  WARNING: Amount is greater than KES 100 in sandbox mode.')
      console.warn('   Sandbox may have issues with large amounts. Try KES 1 for testing.')
    }
    
    console.log('🚀 Initiating STK Push with:', {
      phone: formattedPhone,
      amount: String(roundedAmount),
      shortcode: MPESA_CONFIG.SHORTCODE,
      environment: MPESA_CONFIG.ENVIRONMENT,
      callbackUrl: MPESA_CONFIG.CALLBACK_URL,
      stkPushUrl: stkPushUrl,
      timestamp: timestamp,
      requestBody: {
        ...requestBody,
        Password: '[REDACTED]', // Don't log the password
      },
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
    console.log('📥 STK Push API Response:')
    console.log('   Status:', response.status, response.statusText)
    console.log('   Headers:', Object.fromEntries(response.headers.entries()))
    console.log('   Body:', responseText)

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
      console.error('❌ STK Push API Error Response:')
      console.error('   ResponseCode:', data.ResponseCode)
      console.error('   ResponseDescription:', data.ResponseDescription)
      console.error('   errorMessage:', data.errorMessage)
      console.error('   Full response:', JSON.stringify(data, null, 2))
      
      // Provide helpful error messages for common error codes
      const errorMessages: Record<string, string> = {
        '1032': 'Request cancelled by user',
        '1037': 'Request timeout - user did not respond',
        '1031': 'Request cancelled by user',
        '1014': 'Invalid phone number format',
        '400.002.02': 'Invalid request',
        '400.002.08': 'Invalid phone number',
      }
      
      const helpfulMessage = errorMessages[data.ResponseCode] || data.ResponseDescription
      
      throw new Error(
        `Mpesa STK Push failed (Code: ${data.ResponseCode}): ${helpfulMessage}`
      )
    }

    console.log('✅ STK Push initiated successfully!')
    console.log('   CheckoutRequestID:', data.CheckoutRequestID)
    console.log('   CustomerMessage:', data.CustomerMessage)
    console.log('   ResponseCode:', data.ResponseCode)
    console.log('   ResponseDescription:', data.ResponseDescription)
    console.log('')
    console.log('📱 Next steps:')
    console.log('   1. Check the phone number:', formattedPhone)
    console.log('   2. Ensure the phone is ON and has network coverage')
    console.log('   3. Wait for STK push notification (usually within 10-30 seconds)')
    console.log('   4. If not received, check:')
    console.log('      - Phone number is correct')
    console.log('      - Using test number in sandbox mode')
    console.log('      - Phone has network signal')
    console.log('      - Mpesa account is active')

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

