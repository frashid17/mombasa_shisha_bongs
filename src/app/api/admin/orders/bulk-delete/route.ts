import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'

// POST - Bulk delete orders
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const body = await req.json()
    const { orderIds } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'orderIds array is required' },
        { status: 400 }
      )
    }

    // Get all orders to restore stock if needed
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Restore stock for products in non-cancelled orders
    for (const order of orders) {
      if (order.status !== 'CANCELLED') {
        for (const item of order.items) {
          if (item.product && item.product.trackInventory) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          }
        }
      }
    }

    // Delete all orders (this will cascade delete order items and payments)
    const result = await prisma.order.deleteMany({
      where: { id: { in: orderIds } },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} order(s)`,
      deletedCount: result.count,
    })
  } catch (error: any) {
    console.error('Error bulk deleting orders:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete orders' },
      { status: 500 }
    )
  }
}

