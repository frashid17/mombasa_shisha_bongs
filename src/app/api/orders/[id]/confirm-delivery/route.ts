import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return createSecureResponse(
        { success: false, error: 'Order not found' },
        404
      )
    }

    // Check ownership (allow guest orders if userId matches or order has guest userId)
    if (order.userId !== userId && order.userId !== 'guest') {
      return createSecureResponse(
        { success: false, error: 'Unauthorized' },
        403
      )
    }

    // Don't allow confirmation if order is already delivered, cancelled, or refunded
    if (order.status === 'DELIVERED') {
      return createSecureResponse(
        { success: false, error: 'Order is already marked as delivered' },
        400
      )
    }

    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      return createSecureResponse(
        { success: false, error: 'Cannot confirm delivery for cancelled or refunded orders' },
        400
      )
    }

    // Update order to mark as delivered and set deliveredAt
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    })

    return createSecureResponse(
      {
        success: true,
        order: updatedOrder,
        message: 'Delivery confirmed successfully. You can now review your items.',
      },
      200
    )
  } catch (error: any) {
    console.error('Delivery confirmation error:', error)
    return createSecureResponse(
      { success: false, error: error.message || 'Failed to confirm delivery' },
      500
    )
  }
}

