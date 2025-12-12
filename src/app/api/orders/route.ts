import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { orderSchema } from '@/utils/validations'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const validated = orderSchema.parse({
      ...body,
      userId: userId || null,
      status: 'PENDING',
    })

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: validated.userId,
        customerName: validated.customerName,
        customerEmail: validated.customerEmail,
        customerPhone: validated.customerPhone,
        deliveryAddress: validated.deliveryAddress,
        city: validated.city,
        notes: validated.notes,
        status: validated.status,
        total: validated.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: {
          create: validated.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 400 })
  }
}

