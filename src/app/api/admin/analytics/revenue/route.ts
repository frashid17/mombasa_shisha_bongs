import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth'
import { format, subMonths, startOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) {
      return user
    }

    const searchParams = request.nextUrl.searchParams
    const months = parseInt(searchParams.get('months') || '6')

    const now = new Date()
    const startDate = startOfMonth(subMonths(now, months - 1))

    // Single optimized query to fetch all data at once
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
    })

    // Group by month in memory (much faster than multiple DB queries)
    const revenueByMonth = new Map<string, number>()
    
    // Initialize all months with 0
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i)
      const monthKey = format(date, 'yyyy-MM')
      revenueByMonth.set(monthKey, 0)
    }

    // Aggregate revenue by month
    orders.forEach((order) => {
      const monthKey = format(order.createdAt, 'yyyy-MM')
      const currentRevenue = revenueByMonth.get(monthKey) || 0
      revenueByMonth.set(monthKey, currentRevenue + Number(order.total))
    })

    // Convert to array and sort
    const revenueData = Array.from(revenueByMonth.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return NextResponse.json({ success: true, data: revenueData })
  } catch (error: any) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
