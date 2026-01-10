'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Smartphone, Loader2, CheckCircle, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface MpesaManualPaymentProps {
  orderId: string
  amount: number
  orderNumber: string
}

const MPESA_NUMBER = '0117037140' // Your M-Pesa number

export default function MpesaManualPayment({
  orderId,
  amount,
  orderNumber,
}: MpesaManualPaymentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [senderName, setSenderName] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(MPESA_NUMBER)
      setCopied(true)
      toast.success('M-Pesa number copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy number')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!referenceNumber.trim()) {
      setError('Please enter the M-Pesa reference number')
      return
    }

    if (!senderName.trim()) {
      setError('Please enter the sender name')
      return
    }

    // Validate reference number format (usually alphanumeric, 8-10 characters)
    if (referenceNumber.trim().length < 6) {
      setError('Reference number must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          referenceNumber: referenceNumber.trim().toUpperCase(),
          senderName: senderName.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSubmitted(true)
        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        const errorMsg = data.error || data.message || 'Failed to submit payment details. Please try again.'
        setError(errorMsg)
      }
    } catch (error: any) {
      console.error('Payment submission error:', error)
      setError('An error occurred. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border-2 border-green-600 rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Payment Details Submitted</h3>
          <p className="text-gray-600">
            Your payment details have been submitted successfully. Our admin will verify and approve your payment.
            You will receive an email notification once your payment is approved.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-red-600 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-red-600" />
        <h3 className="text-xl font-bold text-gray-900">Pay with M-Pesa - {MPESA_NUMBER}</h3>
      </div>

      {/* Instructions */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 space-y-3">
        <div>
          <p className="font-semibold text-gray-900 mb-2">Step 1: Send Money</p>
          <p className="text-sm text-gray-700">
            Send <span className="font-bold text-red-600">KES {amount.toLocaleString()}</span> to:
          </p>
          <div className="mt-2 p-3 bg-white border-2 border-red-600 rounded-lg flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-gray-900 flex-1 text-center">{MPESA_NUMBER}</p>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              title="Copy M-Pesa number"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-2">Step 2: Enter Payment Details</p>
          <p className="text-sm text-gray-700">
            After sending the money, enter the M-Pesa reference number and sender name below.
          </p>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="mpesa-reference" className="block text-sm font-semibold text-gray-900 mb-2">
            M-Pesa Reference Number *
          </label>
          <input
            type="text"
            id="mpesa-reference"
            name="referenceNumber"
            value={referenceNumber}
            onChange={(e) => {
              setReferenceNumber(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="e.g., QGH12345"
            autoComplete="off"
            className="w-full bg-white border-2 border-red-600 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            disabled={loading}
            required
            maxLength={20}
          />
          <p className="text-xs text-gray-600 mt-1">
            Found in your M-Pesa confirmation message (e.g., QGH12345)
          </p>
        </div>

        <div>
          <label htmlFor="mpesa-sender-name" className="block text-sm font-semibold text-gray-900 mb-2">
            Sender Name (M-Pesa Name) *
          </label>
          <input
            type="text"
            id="mpesa-sender-name"
            name="senderName"
            value={senderName}
            onChange={(e) => {
              setSenderName(e.target.value)
              setError('')
            }}
            placeholder="e.g., JOHN DOE"
            autoComplete="name"
            className="w-full bg-white border-2 border-red-600 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            disabled={loading}
            required
            maxLength={100}
          />
          <p className="text-xs text-gray-600 mt-1">
            The name that appears in your M-Pesa confirmation message
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-600 rounded-lg p-3 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !referenceNumber.trim() || !senderName.trim()}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              Submit Payment Details
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-600 text-center">
        After submitting, our admin will verify your payment and approve it. You'll receive an email notification once approved.
      </p>
    </div>
  )
}

