import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import { Eye, Mail, Phone, Send } from 'lucide-react'
import BulkEmailButton from '@/components/admin/customers/BulkEmailButton'

async function getCustomers() {
  // Get unique customers from orders
  const orders = await prisma.order.findMany({
    select: {
      userId: true,
      userEmail: true,
      userName: true,
      userPhone: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group by userId to get unique customers
  const customerMap = new Map()
  orders.forEach((order) => {
    if (!customerMap.has(order.userId)) {
      customerMap.set(order.userId, {
        userId: order.userId,
        email: order.userEmail,
        name: order.userName,
        phone: order.userPhone,
        firstOrderDate: order.createdAt,
        lastOrderDate: order.createdAt,
        orderCount: 0,
      })
    }
    const customer = customerMap.get(order.userId)
    customer.orderCount += 1
    if (order.createdAt > customer.lastOrderDate) {
      customer.lastOrderDate = order.createdAt
    }
    if (order.createdAt < customer.firstOrderDate) {
      customer.firstOrderDate = order.createdAt
    }
  })

  // Get order totals for each customer
  const customersWithTotals = await Promise.all(
    Array.from(customerMap.values()).map(async (customer) => {
      const customerOrders = await prisma.order.findMany({
        where: { userId: customer.userId },
        select: { total: true },
      })
      const totalSpent = customerOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      )
      return {
        ...customer,
        totalSpent,
      }
    })
  )

  return customersWithTotals.sort((a, b) => b.totalSpent - a.totalSpent)
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden md:table-cell">
                    Contact
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden lg:table-cell">
                    First Order
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden lg:table-cell">
                    Last Order
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.userId} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="font-semibold text-xs sm:text-sm text-gray-900">{customer.name || 'Guest'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">ID: {customer.userId.slice(0, 8)}...</div>
                      <div className="md:hidden mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[200px]">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{customer.orderCount}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        KES {customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700 hidden lg:table-cell">
                      {format(new Date(customer.firstOrderDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700 hidden lg:table-cell">
                      {format(new Date(customer.lastOrderDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <Link
                        href={`/admin/orders?userId=${customer.userId}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">View Orders</span>
                        <span className="sm:hidden">View</span>
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

