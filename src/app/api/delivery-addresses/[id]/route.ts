import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'
import { z } from 'zod'

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50).optional(),
  fullName: z.string().min(1, 'Full name is required').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deliveryNotes: z.string().optional(),
  isDefault: z.boolean().optional(),
})

// GET - Get a specific delivery address
export async function GET(
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

    return createSecureResponse({
      success: true,
      data: address,
    })
  } catch (error: any) {
    console.error('Error fetching delivery address:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to fetch delivery address',
      },
      500
    )
  }
}

// PUT - Update a delivery address
export async function PUT(
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
    const existingAddress = await prisma.deliveryAddress.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingAddress) {
      return createSecureResponse(
        { success: false, error: 'Address not found' },
        404
      )
    }

    const body = await req.json()
    const validated = addressSchema.parse(body)

    // If setting as default, unset all other default addresses
    if (validated.isDefault === true) {
      await prisma.deliveryAddress.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const address = await prisma.deliveryAddress.update({
      where: { id },
      data: {
        ...(validated.label !== undefined && { label: validated.label }),
        ...(validated.fullName !== undefined && { fullName: validated.fullName }),
        ...(validated.phone !== undefined && { phone: validated.phone }),
        ...(validated.address !== undefined && { address: validated.address }),
        ...(validated.city !== undefined && { city: validated.city }),
        ...(validated.latitude !== undefined && { latitude: validated.latitude }),
        ...(validated.longitude !== undefined && { longitude: validated.longitude }),
        ...(validated.deliveryNotes !== undefined && { deliveryNotes: validated.deliveryNotes }),
        ...(validated.isDefault !== undefined && { isDefault: validated.isDefault }),
      },
    })

    return createSecureResponse({
      success: true,
      data: address,
    })
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

    console.error('Error updating delivery address:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to update delivery address',
      },
      500
    )
  }
}

// DELETE - Delete a delivery address
export async function DELETE(
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
    const existingAddress = await prisma.deliveryAddress.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingAddress) {
      return createSecureResponse(
        { success: false, error: 'Address not found' },
        404
      )
    }

    await prisma.deliveryAddress.delete({
      where: { id },
    })

    return createSecureResponse({
      success: true,
      message: 'Address deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting delivery address:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to delete delivery address',
      },
      500
    )
  }
}

