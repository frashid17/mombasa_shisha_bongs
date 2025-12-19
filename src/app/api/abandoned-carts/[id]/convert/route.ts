import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'

// POST - Mark abandoned cart as converted (when order is placed)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const abandonedCart = await prisma.abandonedCart.findUnique({
      where: { id },
    })

    if (!abandonedCart) {
      return createSecureResponse(
        { success: false, error: 'Abandoned cart not found' },
        404
      )
    }

    // Mark as converted
    await prisma.abandonedCart.update({
      where: { id },
      data: { converted: true },
    })

    return createSecureResponse({
      success: true,
      message: 'Abandoned cart marked as converted',
    })
  } catch (error: any) {
    console.error('Error converting abandoned cart:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to convert abandoned cart',
      },
      500
    )
  }
}

