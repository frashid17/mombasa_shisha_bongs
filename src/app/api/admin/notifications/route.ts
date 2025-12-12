import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth'

export async function GET(req: Request) {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) {
      return user
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Get recent notifications
    const where = unreadOnly
      ? {
          status: { in: ['PENDING', 'FAILED'] },
        }
      : {}

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Get unread count (PENDING or FAILED notifications)
    const unreadCount = await prisma.notification.count({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
      },
    })

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        channel: n.channel,
        subject: n.subject,
        recipientEmail: n.recipientEmail,
        status: n.status,
        createdAt: n.createdAt,
        sentAt: n.sentAt,
        orderNumber: n.order?.orderNumber,
      })),
      unreadCount,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

