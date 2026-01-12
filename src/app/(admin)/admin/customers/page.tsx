import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import { Eye, Mail, Phone, Send } from 'lucide-react'
import BulkEmailButton from '@/components/admin/customers/BulkEmailButton'

async function getCustomers() {
  // Use a single aggregated query instead of per-customer queries
  const grouped = await prisma.order.groupBy({
    by: ['userId', 'userEmail', 'userName', 'userPhone'],
    _sum: {
      total: true,
    },
    _count: {
      _all: true,
    },
    _min: {
      createdAt: true,
    },
    _max: {
      createdAt: true,
    },
    orderBy: {
      _sum: {
        total: 'desc',
      },
    },
    take: 200, // Cap to top 200 customers to avoid excessive data
  })

  return grouped.map((c) => ({
    userId: c.userId || 'guest',
    email: c.userEmail,
    name: c.userName,
    phone: c.userPhone,
    firstOrderDate: c._min.createdAt!,
    lastOrderDate: c._max.createdAt!,
    orderCount: c._count._all,
    totalSpent: Number(c._sum.total || 0),
  }))
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm sm:text-base text-gray-700 mt-1">Manage and view customer information</p>
          </div>
          <BulkEmailButton customerCount={customers.length} />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {customers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer.userId} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{customer.name || 'Guest'}</h3>
                  <p className="text-xs text-gray-500 mt-1">ID: {customer.userId.slice(0, 12)}...</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Orders</p>
                  <p className="text-lg font-bold text-gray-900">{customer.orderCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                  <p className="text-lg font-bold text-gray-900">
                    KES {customer.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">First Order</p>
                  <p className="text-sm text-gray-700">{format(new Date(customer.firstOrderDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Order</p>
                  <p className="text-sm text-gray-700">{format(new Date(customer.lastOrderDate), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-gray-200">
                <Link
                  href={`/admin/orders?userId=${customer.userId}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Orders
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    First Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-gray-900">{customer.name || 'Guest'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">ID: {customer.userId.slice(0, 12)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[200px]">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{customer.orderCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        KES {customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {format(new Date(customer.firstOrderDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {format(new Date(customer.lastOrderDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/orders?userId=${customer.userId}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Orders</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">No customers found</div>
        )}
      </div>
    </div>
  )
}

