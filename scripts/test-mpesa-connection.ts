/**
 * Test Mpesa Connection Script
 * 
 * This script tests if your Mpesa credentials are correctly configured
 * and if you can successfully connect to the Mpesa Daraja API.
 * 
 * Usage: npx tsx scripts/test-mpesa-connection.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local FIRST
const envPath = resolve(__dirname, '../.env.local')
config({ path: envPath })

// Verify env vars are loaded
const MPESA_CONFIG = {
  CONSUMER_KEY: (process.env.MPESA_CONSUMER_KEY || '').trim(),
  CONSUMER_SECRET: (process.env.MPESA_CONSUMER_SECRET || '').trim(),
  PASSKEY: (process.env.MPESA_PASSKEY || '').trim(),
  SHORTCODE: (process.env.MPESA_SHORTCODE || '').trim(),
  CALLBACK_URL: (process.env.MPESA_CALLBACK_URL || '').trim(),
  ENVIRONMENT: (process.env.MPESA_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  SANDBOX_URL: 'https://sandbox.safaricom.co.ke',
  PRODUCTION_URL: 'https://api.safaricom.co.ke',
  AUTH_URL: '/oauth/v1/generate?grant_type=client_credentials',
  STK_PUSH_URL: '/mpesa/stkpush/v1/processrequest',
  QUERY_URL: '/mpesa/stkpushquery/v1/query',
}

// Now import mpesa functions (they'll use the constants from their own module)
// But we'll test directly with our loaded config
async function getMpesaAccessToken(): Promise<string> {
  const baseUrl = MPESA_CONFIG.ENVIRONMENT === 'production' 
    ? MPESA_CONFIG.PRODUCTION_URL 
    : MPESA_CONFIG.SANDBOX_URL

  const authUrl = `${baseUrl}${MPESA_CONFIG.AUTH_URL}`
  const credentials = Buffer.from(
    `${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`
  ).toString('base64')

  const response = await fetch(authUrl, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Mpesa auth failed: ${errorText || response.statusText}`)
  }

  const data = await response.json()
  if (!data.access_token) {
    throw new Error('No access token in response')
  }
  return data.access_token
}

async function testMpesaConnection() {
  console.log('🔍 Testing Mpesa Connection...\n')
  console.log('Configuration:')
  console.log(`  Environment: ${MPESA_CONFIG.ENVIRONMENT}`)
  console.log(`  Shortcode: ${MPESA_CONFIG.SHORTCODE}`)
  console.log(`  Callback URL: ${MPESA_CONFIG.CALLBACK_URL}`)
  console.log(`  Consumer Key: ${MPESA_CONFIG.CONSUMER_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`  Consumer Secret: ${MPESA_CONFIG.CONSUMER_SECRET ? '✅ Set' : '❌ Missing'}`)
  console.log(`  Passkey: ${MPESA_CONFIG.PASSKEY ? '✅ Set' : '❌ Missing'}\n`)

  // Check if credentials are set
  if (!MPESA_CONFIG.CONSUMER_KEY || !MPESA_CONFIG.CONSUMER_SECRET || !MPESA_CONFIG.PASSKEY) {
    console.error('❌ Error: Missing Mpesa credentials!')
    console.error('Please set the following in your .env.local file:')
    console.error('  - MPESA_CONSUMER_KEY')
    console.error('  - MPESA_CONSUMER_SECRET')
    console.error('  - MPESA_PASSKEY')
    console.error('  - MPESA_SHORTCODE')
    console.error('  - MPESA_CALLBACK_URL')
    process.exit(1)
  }

  // Test 1: Access Token Generation
  console.log('Test 1: Generating Access Token...')
  try {
    const accessToken = await getMpesaAccessToken()
    console.log('✅ Success! Access token generated')
    console.log(`   Token: ${accessToken.substring(0, 20)}...\n`)
  } catch (error: any) {
    console.error('❌ Failed to generate access token')
    console.error(`   Error: ${error.message}\n`)
    console.error('Possible issues:')
    console.error('  - Invalid consumer key or secret')
    console.error('  - Network connectivity issues')
    console.error('  - Mpesa API is down')
    process.exit(1)
  }

  // Test 2: STK Push Initiation (Optional - requires valid order)
  console.log('Test 2: STK Push Initiation (Skipped - requires order ID)')
  console.log('   To test STK Push, create an order and use the payment button\n')

  console.log('✅ All basic tests passed!')
  console.log('\n📝 Next Steps:')
  console.log('  1. Make sure your callback URL is publicly accessible (use ngrok for local)')
  console.log('  2. Create a test order on your website')
  console.log('  3. Try making a payment with a test phone number')
  console.log('  4. Check the payment status in your database\n')
}

// Run the test
testMpesaConnection().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})

