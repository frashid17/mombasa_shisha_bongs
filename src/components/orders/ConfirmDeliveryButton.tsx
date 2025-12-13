'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ConfirmDeliveryButtonProps {
  orderId: string
  orderStatus: string
  onConfirmed?: () => void
}

export default function ConfirmDeliveryButton({
  orderId,
  orderStatus,
  onConfirmed,
}: ConfirmDeliveryButtonProps) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const canConfirm = orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED'

  const handleConfirm = async () => {
    if (!canConfirm) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-delivery`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setConfirmed(true)
        if (onConfirmed) {
          onConfirmed()
        }
        // Refresh the page to show updated status
        router.refresh()
      } else {
        setError(data.error || 'Failed to confirm delivery')
      }
    } catch (err: any) {
      console.error('Delivery confirmation error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-green-300 font-semibold">Delivery Confirmed!</p>
            <p className="text-green-400 text-sm">
              You can now review your items below.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!canConfirm) {
    return null
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirming...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Confirm Delivery
          </>
        )}
      </button>
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

