'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Loader2 } from 'lucide-react'

interface PaystackPaymentButtonProps {
  orderId: string
  amount: number
  orderNumber: string
  customerEmail: string
}

export default function PaystackPaymentButton({
  orderId,
  amount,
  orderNumber,
  customerEmail,
}: PaystackPaymentButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePayment() {
    if (!customerEmail.trim()) {
      setError('Email is required for Paystack payment')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/paystack/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email: customerEmail,
        }),
      })

      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response from /api/paystack/initiate:', text.substring(0, 200))
        setError('Server error: Invalid response format. Please try again or contact support.')
        setLoading(false)
        return
      }

      const data = await res.json()

      console.log('Paystack initiation response:', {
        ok: res.ok,
        success: data.success,
        hasAuthorizationUrl: !!data.data?.authorizationUrl,
        authorizationUrl: data.data?.authorizationUrl,
        error: data.error,
      })

      if (res.ok && data.success) {
        // Redirect to Paystack payment page
        if (data.data?.authorizationUrl) {
          console.log('Redirecting to Paystack:', data.data.authorizationUrl)
          // Use window.location.href for full page redirect
          window.location.href = data.data.authorizationUrl
        } else {
          console.error('No authorization URL in response:', data)
          setError('Payment URL not received. Please try again.')
          setLoading(false)
        }
      } else {
        const errorMsg = data.error || 'Failed to initiate payment. Please try again.'
        setError(errorMsg)
        console.error('Paystack initiation failed:', {
          status: res.status,
          error: data.error,
          response: data,
        })
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      if (error.message && error.message.includes('JSON')) {
        setError('Server error: Invalid response. Please try again or contact support.')
      } else {
        setError(error.message || 'An error occurred. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Pay with Paystack</h3>
      </div>

      <div>
        <p className="text-sm text-gray-300 mb-2">
          Pay securely with Paystack. You'll be redirected to complete your payment.
        </p>
        <p className="text-xs text-gray-400">
          Supports: Cards, Mobile Money (Mpesa, Airtel), Bank Transfer
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || !customerEmail.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay KES {amount.toLocaleString()} with Paystack
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        You'll be redirected to Paystack to complete your payment securely.
      </p>
    </div>
  )
}

