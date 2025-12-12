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
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '')
  const [error, setError] = useState('')

  async function handlePayment() {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number')
      return
    }

    // Validate Kenyan phone number format
    const phoneRegex = /^(\+254|0)?[17]\d{8}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid Kenyan phone number (e.g., 0712345678)')
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
          phoneNumber: phoneNumber.replace(/\s/g, ''),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Show success message
        alert(
          `Payment request sent to ${phoneNumber}!\n\n${data.data.message}\n\nPlease check your phone and enter your Mpesa PIN.`
        )
        // Refresh the page to show updated payment status
        router.refresh()
      } else {
        setError(data.error || 'Failed to initiate payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError('An error occurred. Please try again.')
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
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            setError('')
          }}
          placeholder="0712345678 or +254712345678"
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />
        <p className="text-xs text-gray-400 mt-1">
          Enter the phone number registered with your Mpesa account
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

