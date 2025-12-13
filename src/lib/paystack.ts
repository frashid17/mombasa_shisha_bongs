/**
 * Paystack Payment Integration
 * 
 * Paystack doesn't require IP whitelisting.
 * Security is handled via webhook signature verification.
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || ''
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: {
      custom_fields: Array<{
        display_name: string
        variable_name: string
        value: string
      }>
      referrer: string
    }
    log: any
    fees: number
    fees_split: any
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
      account_name: string | null
    }
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string | null
      metadata: any
      risk_action: string
    }
    plan: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
    pos_transaction_data: any
    source: any
    fees_breakdown: any
  }
}

/**
 * Initialize Paystack payment
 */
export async function initializePaystackPayment(
  email: string,
  amount: number, // in Kobo (KES * 100)
  reference: string,
  metadata?: Record<string, any>
): Promise<PaystackInitializeResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  const url = `${PAYSTACK_BASE_URL}/transaction/initialize`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // Convert to Kobo
      reference,
      currency: 'KES',
      metadata: metadata || {},
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/paystack/callback`,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Paystack initialization error:', error)
    throw new Error(`Paystack API error: ${error}`)
  }

  const data = await response.json()
  
  if (!data.status) {
    throw new Error(data.message || 'Failed to initialize Paystack payment')
  }

  return data
}

/**
 * Verify Paystack transaction
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  const url = `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Paystack verification error:', error)
    throw new Error(`Paystack API error: ${error}`)
  }

  const data = await response.json()
  
  if (!data.status) {
    throw new Error(data.message || 'Failed to verify Paystack transaction')
  }

  return data
}

/**
 * Verify Paystack webhook signature
 * Paystack uses HMAC SHA512 to sign webhooks
 */
export function verifyPaystackWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    console.error('Paystack webhook secret is not configured')
    return false
  }

  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex')

  return hash === signature
}

/**
 * Get Paystack public key (for frontend)
 */
export function getPaystackPublicKey(): string {
  return PAYSTACK_PUBLIC_KEY
}

