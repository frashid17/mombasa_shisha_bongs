import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createOrderSchema } from '@/utils/validations'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const validated = createOrderSchema.parse(body)

    // Fetch product details for order items
    const productIds = validated.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: { take: 1 } },
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    // Calculate totals
    const subtotal = validated.items.reduce((sum, item) => {
      const product = productMap.get(item.productId)
      const price = product ? Number(product.price) : item.price
      return sum + price * item.quantity
    }, 0)
    const deliveryFee = 0
    const tax = 0
    const discount = 0
    const total = subtotal + deliveryFee + tax - discount

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || 'guest',
        userEmail: validated.customerEmail,
        userName: validated.customerName,
        userPhone: validated.customerPhone,
        deliveryAddress: validated.deliveryAddress,
        deliveryCity: validated.city,
        deliveryNotes: validated.notes || null,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: validated.items.map((item) => {
            const product = productMap.get(item.productId)
            return {
              productId: item.productId,
              productName: product?.name || '',
              productSku: product?.sku || null,
              productImage: product?.images[0]?.url || null,
              price: product ? Number(product.price) : item.price,
              quantity: item.quantity,
              subtotal: (product ? Number(product.price) : item.price) * item.quantity,
            }
          }),
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

