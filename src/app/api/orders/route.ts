import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createOrderSchema } from '@/utils/validations'
import { sendOrderConfirmationNotification } from '@/lib/notifications'
import { withRateLimit } from '@/utils/rate-limit'
import { RATE_LIMITS } from '@/utils/constants'
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/utils/sanitize'
import { createSecureResponse } from '@/utils/security-headers'

async function handlePOST(req: Request) {
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

    // Determine payment status based on payment method
    const paymentStatus = validated.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING'
    const orderStatus = validated.paymentMethod === 'CASH_ON_DELIVERY' ? 'CONFIRMED' : 'PENDING'

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
        deliveryLatitude: validated.deliveryLatitude || null,
        deliveryLongitude: validated.deliveryLongitude || null,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        status: orderStatus,
        paymentStatus,
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
        // Create payment record for COD orders
        payment: validated.paymentMethod === 'CASH_ON_DELIVERY' ? {
          create: {
            method: 'CASH_ON_DELIVERY',
            amount: total,
            currency: 'KES',
            status: 'PENDING',
          },
        } : undefined,
      },
      include: { items: { include: { product: true } }, payment: true },
    })

    // Send order confirmation notification (async, don't wait)
    sendOrderConfirmationNotification(order.id, {
      orderNumber: order.orderNumber,
      customerName: order.userName,
      customerEmail: order.userEmail,
      customerPhone: order.userPhone,
      total: Number(order.total),
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
    }).catch((error) => {
      console.error('Failed to send order confirmation notification:', error)
      // Don't fail the order creation if notification fails
    })

    return createSecureResponse({ order }, 201)
  } catch (error: any) {
    console.error('Order creation error:', error)
    return createSecureResponse(
      { success: false, error: error.message || 'Failed to create order' },
      400
    )
  }
}

// Apply rate limiting
export const POST = withRateLimit(RATE_LIMITS.CREATE_ORDER)(handlePOST)

