import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { Mail, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'

async function getNotifications() {
  return prisma.notification.findMany({
    include: {
      order: {
        select: {
          orderNumber: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
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

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-700 mt-1">View all notification logs and delivery status</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Sent At
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => {
                const ChannelIcon = channelIcons[notification.channel] || AlertCircle
                const StatusIcon = statusIcons[notification.status] || Clock

                return (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{notification.type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ChannelIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{notification.channel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900">{notification.recipientEmail}</div>
                        {notification.recipientPhone && (
                          <div className="text-gray-500 text-xs">{notification.recipientPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notification.order ? (
                        <span className="text-sm font-mono text-gray-900">
                          #{notification.order.orderNumber}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {notification.sentAt
                        ? format(new Date(notification.sentAt), 'MMM d, yyyy HH:mm')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {notification.errorMessage || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">No notifications found</div>
        )}
      </div>
    </div>
  )
}

