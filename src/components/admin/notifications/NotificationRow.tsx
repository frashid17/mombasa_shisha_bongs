'use client'

import { useRouter } from 'next/navigation'
import { Mail, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface NotificationRowProps {
  notification: {
    id: string
    type: string
    channel: string
    recipientEmail: string
    recipientPhone: string | null
    status: string
    sentAt: Date | null
    errorMessage: string | null
    createdAt: Date
    order: {
      orderNumber: string
    } | null
  }
}

const channelIcons: Record<string, any> = {
  EMAIL: Mail,
  SMS: MessageSquare,
  WHATSAPP: MessageSquare,
  PUSH: AlertCircle,
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800',
  DELIVERED: 'bg-green-100 text-green-800',
}

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  SENT: CheckCircle,
  FAILED: XCircle,
  DELIVERED: CheckCircle,
}

export default function NotificationRow({ notification }: NotificationRowProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const ChannelIcon = channelIcons[notification.channel] || AlertCircle
  const StatusIcon = statusIcons[notification.status] || Clock

  const handleRowClick = () => {
    router.push(`/admin/notifications/${notification.id}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Delete this notification?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/notifications/${notification.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Notification deleted')
        router.refresh()
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {notification.type.replace(/_/g, ' ')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <ChannelIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-900">{notification.channel}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="text-gray-900 font-medium">{notification.recipientEmail}</div>
          {notification.recipientPhone && (
            <div className="text-gray-500 text-xs mt-1">{notification.recipientPhone}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {notification.order ? (
          <span className="text-sm font-mono font-medium text-gray-900">
            #{notification.order.orderNumber}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[notification.status] || statusColors.PENDING}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {notification.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {notification.sentAt
          ? format(new Date(notification.sentAt), 'MMM d, yyyy HH:mm')
          : '-'}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
        <div className="truncate" title={notification.errorMessage || ''}>
          {notification.errorMessage || '-'}
        </div>
      </td>
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete notification"
          aria-label="Delete notification"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </td>
    </tr>
  )
}

