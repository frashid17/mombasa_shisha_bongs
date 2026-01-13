import prisma from '@/lib/prisma'
import NotificationCard from '@/components/admin/notifications/NotificationCard'
import MarkAllNotificationsButton from '@/components/admin/notifications/MarkAllNotificationsButton'
import DeleteAllNotificationsButton from '@/components/admin/notifications/DeleteAllNotificationsButton'
import { Bell } from 'lucide-react'

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

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-700 mt-1">View all notification logs and delivery status</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <MarkAllNotificationsButton />
          <DeleteAllNotificationsButton />
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-600">Notification logs will appear here as they are sent.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  )
}

