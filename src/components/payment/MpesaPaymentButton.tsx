'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Smartphone, Loader2 } from 'lucide-react'

interface MpesaPaymentButtonProps {
  orderId: string
  amount: number
  orderNumber: string
  phoneNumber?: string
}

export default function MpesaPaymentButton({
  orderId,
  amount,
  orderNumber,
  phoneNumber: initialPhoneNumber,
}: MpesaPaymentButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Extract just the digits if phone number has +254 prefix
  const extractPhoneDigits = (phone: string) => {
    if (!phone) return ''
    // Remove +254 prefix if present, or 0 prefix, then take last 9 digits
    const cleaned = phone.replace(/^\+254/, '').replace(/^0/, '').replace(/\D/g, '')
    return cleaned.slice(-9) // Take last 9 digits
  }
  const [phoneNumber, setPhoneNumber] = useState(extractPhoneDigits(initialPhoneNumber || ''))
  const [error, setError] = useState('')

  async function handlePayment() {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number')
      return
    }

    // Validate phone number (should be 9 digits)
    if (phoneNumber.length !== 9 || !/^[17]\d{8}$/.test(phoneNumber)) {
      setError('Please enter a valid Kenyan phone number (9 digits starting with 7 or 1)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          phoneNumber: `+254${phoneNumber}`, // Add +254 prefix
        }),
      })

      // Check if response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text.substring(0, 200))
        setError('Server error: Invalid response format. Please try again or contact support.')
        setLoading(false)
        return
      }

      const data = await res.json()

      if (res.ok && data.success) {
        // Show success message with more details
        const message = data.data?.message || 'STK Push request sent successfully'
        console.log('STK Push initiated successfully:', {
          checkoutRequestId: data.data?.checkoutRequestId,
          message: data.data?.message,
        })
        
        // Check if in sandbox mode and show appropriate message
        const isSandbox = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')
        const sandboxWarning = isSandbox 
          ? '\n\n⚠️ SANDBOX MODE: Make sure you are using a TEST phone number from the Mpesa Developer Portal. Real phone numbers will NOT work in sandbox.'
          : ''
        
        alert(
          `Payment request sent to +254${phoneNumber}!\n\n${message}\n\nPlease check your phone and enter your Mpesa PIN.${sandboxWarning}\n\nIf you don't receive the prompt within 30 seconds, please check:\n1. You're using a test number (sandbox mode)\n2. Your phone has network connection\n3. Try again`
        )
        // Refresh the page to show updated payment status
        router.refresh()
      } else {
        const errorMsg = data.error || data.message || 'Failed to initiate payment. Please try again.'
        console.error('STK Push initiation failed:', {
          error: data.error || data.message,
          response: data,
          status: res.status,
          statusText: res.statusText,
        })
        setError(errorMsg)
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      if (error.message && error.message.includes('JSON')) {
        setError('Server error: Invalid response. Please try again or contact support.')
      } else {
        setError(error.message || 'An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border-2 border-red-600 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-red-600" />
        <h3 className="text-xl font-bold text-gray-900">Pay with Mpesa</h3>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Phone Number *
        </label>
        <div className="flex items-center">
          <span className="bg-red-50 text-gray-700 px-3 py-3 rounded-l-lg border-2 border-r-0 border-red-600 font-semibold">
            +254
          </span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              // Remove any non-digit characters and limit to 9 digits
              const value = e.target.value.replace(/\D/g, '').slice(0, 9)
              setPhoneNumber(value)
              setError('')
            }}
            placeholder="708786000"
            className="flex-1 bg-white border-2 border-red-600 rounded-r-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            disabled={loading}
            pattern="[0-9]{9}"
            maxLength={9}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Enter 9 digits (e.g., 708786000). The +254 prefix is added automatically.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-3 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || !phoneNumber.trim()}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Smartphone className="w-5 h-5" />
            Pay KES {amount.toLocaleString()} with Mpesa
          </>
        )}
      </button>

      <p className="text-xs text-gray-600 text-center">
        You will receive an STK Push notification on your phone. Enter your Mpesa PIN to complete
        the payment.
      </p>
    </div>
  )
}

