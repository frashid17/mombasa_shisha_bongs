import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) {
      return admin
    }

    // Delete all notifications
    const result = await prisma.notification.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} notification(s)`,
      count: result.count,
    })
  } catch (error: any) {
    console.error('Error deleting all notifications:', error)
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    )
  }
}
