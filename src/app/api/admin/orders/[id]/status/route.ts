import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { updateOrderStatusSchema } from '@/utils/validations'
import { sendOrderShippedNotification, sendOrderDeliveredNotification } from '@/lib/notifications'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Validate the update data
    const validated = updateOrderStatusSchema.parse(body)

    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    })

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Restore stock if order is being cancelled and was previously not cancelled
    if (validated.status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
      for (const item of currentOrder.items) {
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

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: validated.status,
        trackingNumber: validated.trackingNumber || null,
        estimatedDelivery: validated.estimatedDelivery || null,
        adminNotes: validated.adminNotes || null,
        deliveredAt: validated.status === 'DELIVERED' ? new Date() : null,
        cancelledAt: validated.status === 'CANCELLED' ? new Date() : null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Send notifications based on status change
    if (validated.status === 'SHIPPED' && currentOrder.status !== 'SHIPPED') {
      // Send order shipped notification
      sendOrderShippedNotification(id, {
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.userName,
        customerEmail: updatedOrder.userEmail,
        customerPhone: updatedOrder.userPhone,
        total: Number(updatedOrder.total),
        items: updatedOrder.items.map((item) => ({
          name: item.productName || item.product?.name || 'Product',
          quantity: item.quantity,
          price: Number(item.price),
        })),
        deliveryAddress: updatedOrder.deliveryAddress,
        deliveryCity: updatedOrder.deliveryCity,
        trackingNumber: validated.trackingNumber || undefined,
        estimatedDelivery: validated.estimatedDelivery
          ? new Date(validated.estimatedDelivery).toLocaleDateString()
          : undefined,
      }).catch((error) => {
        console.error('Failed to send order shipped notification:', error)
      })
    }

    if (validated.status === 'DELIVERED' && currentOrder.status !== 'DELIVERED') {
      // Send order delivered notification
      sendOrderDeliveredNotification(id, {
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.userName,
        customerEmail: updatedOrder.userEmail,
        customerPhone: updatedOrder.userPhone,
        total: Number(updatedOrder.total),
        items: updatedOrder.items.map((item) => ({
          name: item.productName || item.product?.name || 'Product',
          quantity: item.quantity,
          price: Number(item.price),
        })),
        deliveryAddress: updatedOrder.deliveryAddress,
        deliveryCity: updatedOrder.deliveryCity,
      }).catch((error) => {
        console.error('Failed to send order delivered notification:', error)
      })
    }

    return NextResponse.json({ order: updatedOrder })
  } catch (error: any) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 400 }
    )
  }
}

