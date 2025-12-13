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
        const errorMsg = data.error || 'Failed to initiate payment. Please try again.'
        console.error('STK Push initiation failed:', {
          error: data.error,
          response: data,
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
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Pay with Mpesa</h3>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Phone Number *
        </label>
        <div className="flex items-center">
          <span className="bg-gray-700 text-gray-300 px-3 py-3 rounded-l-lg border border-r-0 border-gray-600">
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
            className="flex-1 bg-gray-900 border border-gray-600 rounded-r-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            disabled={loading}
            pattern="[0-9]{9}"
            maxLength={9}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Enter 9 digits (e.g., 708786000). The +254 prefix is added automatically.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || !phoneNumber.trim()}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      <p className="text-xs text-gray-400 text-center">
        You will receive an STK Push notification on your phone. Enter your Mpesa PIN to complete
        the payment.
      </p>
    </div>
  )
}

