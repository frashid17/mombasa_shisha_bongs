import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createSecureResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    // Get last 6 months of revenue data
    const now = new Date()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const revenueData = []

    // Loop through last 6 months (current month and 5 previous months)
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
      const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999)

      // Get revenue for this month
      const monthRevenue = await prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          total: true,
        },
      })

      revenueData.push({
        month: monthNames[targetDate.getMonth()],
        revenue: Number(monthRevenue._sum.total || 0),
      })
    }

    return createSecureResponse({
      success: true,
      data: revenueData,
    })
  } catch (error: any) {
    console.error('Error fetching revenue data:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to fetch revenue data',
      },
      500
    )
  }
}
