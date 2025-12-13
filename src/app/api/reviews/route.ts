import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createReviewSchema } from '@/utils/validations'
import { withRateLimit } from '@/utils/rate-limit'
import { RATE_LIMITS } from '@/utils/constants'
import { createSecureResponse } from '@/utils/security-headers'

async function handlePOST(req: Request) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const validated = createReviewSchema.parse(body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    })

    if (!product) {
      return createSecureResponse(
        { success: false, error: 'Product not found' },
        404
      )
    }

    // If orderId is provided, verify the user has this order and it's delivered
    if (validated.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: validated.orderId },
        include: { items: true },
      })

      if (!order) {
        return createSecureResponse(
          { success: false, error: 'Order not found' },
          404
        )
      }

      // Check ownership (allow guest orders)
      if (order.userId !== userId && order.userId !== 'guest') {
        return createSecureResponse(
          { success: false, error: 'Unauthorized' },
          403
        )
      }

      // Check if order contains this product
      const hasProduct = order.items.some(
        (item) => item.productId === validated.productId
      )

      if (!hasProduct) {
        return createSecureResponse(
          { success: false, error: 'Product not found in this order' },
          400
        )
      }

      // Check if order is delivered
      if (order.status !== 'DELIVERED') {
        return createSecureResponse(
          { success: false, error: 'Order must be delivered before reviewing' },
          400
        )
      }

      // Check if user already reviewed this product for this order
      const existingReview = await prisma.review.findFirst({
        where: {
          productId: validated.productId,
          userId: userId || 'guest',
          // Check if there's an orderId field or use a different method
        },
      })

      // For now, allow multiple reviews but mark as verified purchase
    }

    // Get user info (if logged in or from order)
    let userName = 'Anonymous'
    let userEmail = 'anonymous@example.com'

    // If orderId is provided, use order's user info
    if (validated.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: validated.orderId },
      })
      if (order) {
        userName = validated.isAnonymous ? 'Anonymous' : order.userName
        userEmail = order.userEmail
      }
    } else if (userId) {
      // If no orderId but user is logged in, try to get from Clerk
      // For now, use a default name
      userName = validated.isAnonymous ? 'Anonymous' : 'Customer'
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: validated.productId,
        userId: userId || 'guest',
        userName: validated.isAnonymous ? 'Anonymous' : userName,
        userEmail: userEmail,
        rating: validated.rating,
        title: validated.title || null,
        comment: validated.comment,
        isVerified: validated.orderId ? true : false,
        isApproved: true, // Auto-approve all reviews
      },
    })

    return createSecureResponse(
      {
        success: true,
        review,
        message: 'Review submitted successfully and is now visible.',
      },
      201
    )
  } catch (error: any) {
    console.error('Review creation error:', error)
    return createSecureResponse(
      { success: false, error: error.message || 'Failed to create review' },
      400
    )
  }
}

export const POST = withRateLimit(RATE_LIMITS.CREATE_REVIEW)(handlePOST)

