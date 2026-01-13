'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DeleteAllNotificationsButton() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL notifications? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/notifications/delete-all', {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Deleted ${data.count} notification(s)`)
        router.refresh()
      } else {
        toast.error('Failed to delete notifications')
      }
    } catch (error) {
      console.error('Error deleting notifications:', error)
      toast.error('Failed to delete notifications')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDeleteAll}
      disabled={isDeleting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? 'Deleting All...' : 'Delete All'}
    </button>
  )
}
