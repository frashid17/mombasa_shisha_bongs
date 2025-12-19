'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CleanupButton() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCleanup = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    // Final confirmation
    const finalConfirm = window.prompt(
      '⚠️ DANGER: This will delete ALL products and orders!\n\n' +
      'Type "DELETE_ALL" to confirm:'
    )

    if (finalConfirm !== 'DELETE_ALL') {
      toast.error('Cleanup cancelled')
      setShowConfirm(false)
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: 'DELETE_ALL_DATA' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete data')
      }

      toast.success(
        `Cleanup successful! Deleted ${data.deleted?.productsDeleted || 0} products and ${data.deleted?.ordersDeleted || 0} orders.`,
        { duration: 5000 }
      )
      
      setShowConfirm(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete data')
      console.error('Cleanup error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative">
      {showConfirm && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-10 min-w-[300px]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">
                Delete All Data?
              </p>
              <p className="text-xs text-red-700 mb-3">
                This will permanently delete ALL products and orders. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCleanup}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={handleCleanup}
        disabled={isDeleting}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Delete all products and orders (test data cleanup)"
      >
        <Trash2 className="w-5 h-5" />
        {isDeleting ? 'Deleting...' : 'Delete All Data'}
      </button>
    </div>
  )
}

