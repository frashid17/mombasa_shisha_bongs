import prisma from '@/lib/prisma'
import NotificationRow from '@/components/admin/notifications/NotificationRow'
import MarkAllNotificationsButton from '@/components/admin/notifications/MarkAllNotificationsButton'
import DeleteAllNotificationsButton from '@/components/admin/notifications/DeleteAllNotificationsButton'

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Sent At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Error</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <NotificationRow key={notification.id} notification={notification} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">No notifications found</div>
        )}
      </div>
    </div>
  )
}

