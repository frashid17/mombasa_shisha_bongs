import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth'
import { NotificationStatus } from '@/generated/prisma'

export async function PUT(req: Request) {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) {
      return user
    }

    const body = await req.json()
    const { status } = body

    if (!status || !['SENT', 'DELIVERED', 'PENDING', 'FAILED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be SENT, DELIVERED, PENDING, or FAILED' },
        { status: 400 }
      )
    }

    // Update all notifications to the specified status
    const result = await prisma.notification.updateMany({
      data: {
        status: status as NotificationStatus,
        sentAt: status === 'SENT' || status === 'DELIVERED' ? new Date() : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Marked ${result.count} notifications as ${status}`,
    })
  } catch (error: any) {
    console.error('Error marking notifications:', error)
    return NextResponse.json({ error: 'Failed to mark notifications' }, { status: 500 })
  }
}

