'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function MarkAllNotificationsButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkAll = async (status: 'SENT' | 'PENDING') => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications/mark-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || `Marked all notifications as ${status}`)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to mark notifications')
      }
    } catch (error) {
      console.error('Error marking notifications:', error)
      toast.error('Failed to mark notifications')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleMarkAll('SENT')}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Mark All as Read
      </button>
      <button
        onClick={() => handleMarkAll('PENDING')}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        Mark All as Unread
      </button>
    </div>
  )
}

