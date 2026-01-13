import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) {
      return user
    }

    const searchParams = request.nextUrl.searchParams
    const months = parseInt(searchParams.get('months') || '6')

    const now = new Date()
    const revenueData = []

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i)
      const startDate = startOfMonth(date)
      const endDate = endOfMonth(date)

      const monthlyRevenue = await prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          total: true,
        },
      })

      revenueData.push({
        month: format(date, 'yyyy-MM'),
        revenue: Number(monthlyRevenue._sum.total || 0),
      })
    }

    return NextResponse.json({ success: true, data: revenueData })
  } catch (error: any) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
