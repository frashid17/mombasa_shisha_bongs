import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'

// GET - Get a single order
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            color: true,
            specification: true,
          },
        },
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an order
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { id } = await params

    // Get order to restore stock if needed
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Restore stock for products if order was not cancelled
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

    // Delete the order (this will cascade delete order items and payment)
    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Order deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete order' },
      { status: 500 }
    )
  }
}

