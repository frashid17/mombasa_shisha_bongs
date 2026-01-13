'use client'

import { useRouter } from 'next/navigation'
import { Mail, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface NotificationCardProps {
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

export default function NotificationCard({ notification }: NotificationCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const ChannelIcon = channelIcons[notification.channel] || AlertCircle
  const StatusIcon = statusIcons[notification.status] || Clock

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
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
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Type and Channel */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-gray-900">
                  {notification.type.replace(/_/g, ' ')}
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                  <ChannelIcon className="w-3.5 h-3.5" />
                  <span className="font-medium">{notification.channel}</span>
                </div>
              </div>
              
              {/* Recipient Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">To:</span>
                  <span className="text-gray-900 font-medium">{notification.recipientEmail}</span>
                </div>
                {notification.recipientPhone && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-700">{notification.recipientPhone}</span>
                  </div>
                )}
                {notification.order && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">Order:</span>
                    <span className="font-mono font-semibold text-gray-900">
                      #{notification.order.orderNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[notification.status] || statusColors.PENDING}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {notification.status}
          </span>
        </div>

        {/* Details Row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-6 text-sm">
            {/* Sent At */}
            <div>
              <span className="text-gray-500">Sent: </span>
              <span className="text-gray-900 font-medium">
                {notification.sentAt
                  ? format(new Date(notification.sentAt), 'MMM d, yyyy HH:mm')
                  : 'Not sent'}
              </span>
            </div>

            {/* Error Message */}
            {notification.errorMessage && (
              <div className="flex items-start gap-1.5 max-w-md">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-red-600 text-xs line-clamp-1" title={notification.errorMessage}>
                  {notification.errorMessage}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleView}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              title="View notification details"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              title="Delete notification"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
