import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'

// POST - Set an address as default
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return createSecureResponse(
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    // Check if address exists and belongs to user
    const address = await prisma.deliveryAddress.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!address) {
      return createSecureResponse(
        { success: false, error: 'Address not found' },
        404
      )
    }

    // Unset all other default addresses
    await prisma.deliveryAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    })

    // Set this address as default
    const updatedAddress = await prisma.deliveryAddress.update({
      where: { id },
      data: { isDefault: true },
    })

    return createSecureResponse({
      success: true,
      data: updatedAddress,
    })
  } catch (error: any) {
    console.error('Error setting default address:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to set default address',
      },
      500
    )
  }
}

