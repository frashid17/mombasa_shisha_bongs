import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'

async function getNotification(id: string) {
  return prisma.notification.findUnique({
    where: { id },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
        },
      },
    },
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

export default async function NotificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const notification = await getNotification(id)

  if (!notification) {
    notFound()
  }

  const ChannelIcon = channelIcons[notification.channel] || AlertCircle
  const StatusIcon = statusIcons[notification.status] || Clock

  // Parse metadata if available
  let metadata: any = null
  if (notification.metadata) {
    try {
      metadata = JSON.parse(notification.metadata)
    } catch (e) {
      // Metadata is not valid JSON, keep as null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/notifications"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notifications
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Notification Details</h1>
          <p className="text-gray-700 mt-1">View complete notification information</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusIcon
            className={`w-6 h-6 ${
              notification.status === 'SENT' || notification.status === 'DELIVERED'
                ? 'text-green-500'
                : notification.status === 'FAILED'
                ? 'text-red-500'
                : 'text-yellow-500'
            }`}
          />
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[notification.status] || statusColors.PENDING}`}
          >
            {notification.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`p-3 rounded-lg ${
                    notification.status === 'SENT' || notification.status === 'DELIVERED'
                      ? 'bg-green-100 text-green-600'
                      : notification.status === 'FAILED'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  <ChannelIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-gray-900">
                    {notification.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Channel</p>
                  <p className="font-semibold text-gray-900">{notification.channel}</p>
                </div>
              </div>

              {notification.subject && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Subject</p>
                  <p className="font-semibold text-gray-900">{notification.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Message</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                    {notification.message}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Error Information */}
          {notification.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Error Information
              </h2>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <pre className="whitespace-pre-wrap text-sm text-red-900 font-sans">
                  {notification.errorMessage}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          {metadata && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Metadata</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-sm text-gray-900 font-mono overflow-x-auto">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recipient Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recipient Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{notification.recipientEmail}</p>
              </div>
              {notification.recipientPhone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{notification.recipientPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Information */}
          {notification.order && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Related Order</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <Link
                    href={`/admin/orders/${notification.order.id}`}
                    className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    #{notification.order.orderNumber}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <p className="font-semibold text-gray-900">{notification.order.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Total</p>
                  <p className="font-semibold text-gray-900">
                    KES {Number(notification.order.total).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Timestamps</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(notification.createdAt), 'MMMM d, yyyy HH:mm:ss')}
                </p>
              </div>
              {notification.sentAt && (
                <div>
                  <p className="text-sm text-gray-600">Sent At</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(notification.sentAt), 'MMMM d, yyyy HH:mm:ss')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(notification.updatedAt), 'MMMM d, yyyy HH:mm:ss')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

