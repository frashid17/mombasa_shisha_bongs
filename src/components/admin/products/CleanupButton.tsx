'use client'

import { useState, useEffect } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CleanupButton() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Close modal on Escape key
  useEffect(() => {
    if (!showConfirm) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        setShowConfirm(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showConfirm, isDeleting])

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
    <>
      {showConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setShowConfirm(false)
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete All Data?
                </h3>
                <p className="text-sm text-gray-700 mb-1">
                  This will permanently delete <strong>ALL products and orders</strong> from the database.
                </p>
                <p className="text-sm text-red-600 font-semibold">
                  This action cannot be undone!
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanup}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>
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
    </>
  )
}

