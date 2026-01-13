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
      <td className="px-3 md:px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-900">
            {notification.type.replace(/_/g, ' ')}
          </span>
          <div className="flex items-center gap-2 sm:hidden">
            <ChannelIcon className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">{notification.channel}</span>
          </div>
          <div className="text-xs text-gray-500 md:hidden">
            {notification.recipientEmail}
          </div>
        </div>
      </td>
      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <ChannelIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-900">{notification.channel}</span>
        </div>
      </td>
      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="text-gray-900">{notification.recipientEmail}</div>
          {notification.recipientPhone && (
            <div className="text-gray-500 text-xs">{notification.recipientPhone}</div>
          )}
        </div>
      </td>
      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
        {notification.order ? (
          <span className="text-sm font-mono text-gray-900">
            #{notification.order.orderNumber}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <StatusIcon
            className={`w-4 h-4 ${
              notification.status === 'SENT' || notification.status === 'DELIVERED'
                ? 'text-green-500'
                : notification.status === 'FAILED'
                ? 'text-red-500'
                : 'text-yellow-500'
            }`}
          />
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[notification.status] || statusColors.PENDING}`}
          >
            {notification.status}
          </span>
        </div>
      </td>
      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {notification.sentAt
          ? format(new Date(notification.sentAt), 'MMM d, yyyy HH:mm')
          : '-'}
      </td>
      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
        {notification.errorMessage || '-'}
      </td>
      <td className="px-3 md:px-6 py-4 text-right whitespace-nowrap">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete notification"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      </td>
    </tr>
  )
}

