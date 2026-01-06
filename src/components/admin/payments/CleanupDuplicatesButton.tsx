'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CleanupDuplicatesButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCleanup() {
    if (!confirm('This will remove duplicate payments with the same reference number. Keep the oldest payment and delete duplicates. Continue?')) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/payments/cleanup-duplicates', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(data.message || 'Duplicate payments cleaned up successfully')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to clean up duplicates')
      }
    } catch (error: any) {
      console.error('Cleanup error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCleanup}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Cleaning...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          Cleanup Duplicates
        </>
      )}
    </button>
  )
}

