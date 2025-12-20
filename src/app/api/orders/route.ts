import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createOrderSchema } from '@/utils/validations'
import { sendOrderConfirmationNotification } from '@/lib/notifications'
import { withRateLimit } from '@/utils/rate-limit'
import { RATE_LIMITS } from '@/utils/constants'
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/utils/sanitize'
import { createSecureResponse } from '@/utils/security-headers'
import { Decimal } from '@prisma/client/runtime/library'

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

    // Fetch active flash sales and build a product -> discountPercent map
    const now = new Date()
    const activeFlashSales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    })

    const flashDiscountMap = new Map<string, number>()

    for (const sale of activeFlashSales) {
      const parsedProductIds = JSON.parse(sale.productIds) as string[]
      const discountPercent = Number(sale.discountPercent)

      for (const pid of parsedProductIds) {
        const current = flashDiscountMap.get(pid) ?? 0
        // If multiple flash sales target same product, use the highest discount
        flashDiscountMap.set(pid, Math.max(current, discountPercent))
      }
    }

    // Check stock availability and validate quantities
    for (const item of validated.items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return createSecureResponse(
          { success: false, error: `Product ${item.productId} not found` },
          404
        )
      }

      if (product.trackInventory && !product.allowBackorder) {
        if (product.stock < item.quantity) {
          return createSecureResponse(
            {
              success: false,
              error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
            },
            400
          )
        }
      }
    }

    // Calculate totals with flash sale discounts applied (if any)
    let subtotal = 0
    let discountTotal = 0

    for (const item of validated.items) {
      const product = productMap.get(item.productId)
      const basePrice = product ? Number(product.price) : item.price
      const discountPercent = flashDiscountMap.get(item.productId) ?? 0
      const effectivePrice =
        discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice

      subtotal += effectivePrice * item.quantity
      discountTotal += (basePrice - effectivePrice) * item.quantity
    }

    // Ensure discount is not negative (shouldn't be, but defensive)
    if (discountTotal < 0) {
      discountTotal = 0
    }

    const deliveryFee = 0
    const tax = 0
    const discount = discountTotal
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
        deliveryLatitude: validated.deliveryLatitude != null ? parseFloat(validated.deliveryLatitude.toFixed(7)) : null,
        deliveryLongitude: validated.deliveryLongitude != null ? parseFloat(validated.deliveryLongitude.toFixed(7)) : null,
        deliveryAddressId: validated.deliveryAddressId || null,
        scheduledDelivery: validated.scheduledDelivery || null,
        subtotal: new Decimal(subtotal),
        deliveryFee: new Decimal(deliveryFee),
        tax: new Decimal(tax),
        discount: new Decimal(discount),
        total: new Decimal(total),
        status: orderStatus,
        paymentStatus,
        items: {
          create: validated.items.map((item) => {
            const product = productMap.get(item.productId)
            const basePrice = product ? Number(product.price) : item.price
            const discountPercent = flashDiscountMap.get(item.productId) ?? 0
            const effectivePrice =
              discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice

            return {
              productId: item.productId,
              productName: product?.name || '',
              productSku: product?.sku || null,
              productImage: product?.images[0]?.url || null,
              price: new Decimal(effectivePrice),
              quantity: item.quantity,
              subtotal: new Decimal(effectivePrice * item.quantity),
            }
          }),
        },
        // Create payment record for COD orders
        payment: validated.paymentMethod === 'CASH_ON_DELIVERY' ? {
          create: {
            method: 'CASH_ON_DELIVERY',
            amount: new Decimal(total),
            currency: 'KES',
            status: 'PENDING',
          },
        } : undefined,
      },
      include: { items: { include: { product: true } }, payment: true },
    })

    // Reduce stock for each product in the order
    for (const item of validated.items) {
      const product = productMap.get(item.productId)
      if (product && product.trackInventory) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }
    }

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
        image: item.productImage || undefined,
      })),
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      paymentMethod: validated.paymentMethod,
      paymentStatus: order.paymentStatus,
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

