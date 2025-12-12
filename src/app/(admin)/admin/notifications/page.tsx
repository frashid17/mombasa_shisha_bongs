import prisma from '@/lib/prisma'
import NotificationRow from '@/components/admin/notifications/NotificationRow'

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-700 mt-1">View all notification logs and delivery status</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Type
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Channel
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Sent At
                </th>
                <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Error
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} />
              ))}
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

