'use client'

import { useRouter } from 'next/navigation'
import { Mail, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

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
  const ChannelIcon = channelIcons[notification.channel] || AlertCircle
  const StatusIcon = statusIcons[notification.status] || Clock

  const handleRowClick = () => {
    router.push(`/admin/notifications/${notification.id}`)
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
    </tr>
  )
}

