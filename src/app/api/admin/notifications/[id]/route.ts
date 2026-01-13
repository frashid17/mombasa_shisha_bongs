import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) {
      return admin
    }

    const { id } = await params

    // Delete the notification
    await prisma.notification.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
