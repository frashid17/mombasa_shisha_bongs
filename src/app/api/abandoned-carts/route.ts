import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'
import { z } from 'zod'

const abandonedCartSchema = z.object({
  cartData: z.string().min(1, 'Cart data is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  sessionId: z.string().optional(),
})

// POST - Track an abandoned cart
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const validated = abandonedCartSchema.parse(body)

    // Get or generate session ID for guest users
    const sessionId = validated.sessionId || (userId ? undefined : `guest-${Date.now()}`)

    // Check if cart data is valid JSON
    let cartItems
    try {
      cartItems = JSON.parse(validated.cartData)
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return createSecureResponse(
          { success: false, error: 'Cart must contain at least one item' },
          400
        )
      }
    } catch {
      return createSecureResponse(
        { success: false, error: 'Invalid cart data format' },
        400
      )
    }

    // Check if abandoned cart already exists for this user/session
    const existing = await prisma.abandonedCart.findFirst({
      where: {
        OR: [
          userId ? { userId } : { sessionId },
          validated.email ? { email: validated.email } : undefined,
        ].filter(Boolean) as any[],
        converted: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      // Update existing abandoned cart
      const updated = await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: {
          cartData: validated.cartData,
          email: validated.email || existing.email,
          phone: validated.phone || existing.phone,
          updatedAt: new Date(),
        },
      })

      return createSecureResponse({
        success: true,
        data: updated,
        message: 'Abandoned cart updated',
      })
    }

    // Create new abandoned cart
    const abandonedCart = await prisma.abandonedCart.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || null,
        email: validated.email || null,
        phone: validated.phone || null,
        cartData: validated.cartData,
      },
    })

    return createSecureResponse(
      {
        success: true,
        data: abandonedCart,
        message: 'Abandoned cart tracked',
      },
      201
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createSecureResponse(
        {
          success: false,
          error: error.issues[0]?.message || 'Validation error',
        },
        400
      )
    }

    console.error('Error tracking abandoned cart:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to track abandoned cart',
      },
      500
    )
  }
}

// GET - Get abandoned carts (admin only)
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createSecureResponse(
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    const abandonedCarts = await prisma.abandonedCart.findMany({
      where: { converted: false },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return createSecureResponse({
      success: true,
      data: abandonedCarts.map((cart) => ({
        ...cart,
        cartData: JSON.parse(cart.cartData),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching abandoned carts:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to fetch abandoned carts',
      },
      500
    )
  }
}

