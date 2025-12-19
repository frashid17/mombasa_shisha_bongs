import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'
import { z } from 'zod'

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deliveryNotes: z.string().optional(),
  isDefault: z.boolean().optional(),
})

// GET - Get all delivery addresses for the user
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createSecureResponse(
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    const addresses = await prisma.deliveryAddress.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' }, // Default address first
        { createdAt: 'desc' },
      ],
    })

    return createSecureResponse({
      success: true,
      data: addresses,
    })
  } catch (error: any) {
    console.error('Error fetching delivery addresses:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to fetch delivery addresses',
      },
      500
    )
  }
}

// POST - Create a new delivery address
export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createSecureResponse(
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    const body = await req.json()
    const validated = addressSchema.parse(body)

    // If this is set as default, unset all other default addresses
    if (validated.isDefault) {
      await prisma.deliveryAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.deliveryAddress.create({
      data: {
        userId,
        label: validated.label,
        fullName: validated.fullName,
        phone: validated.phone,
        address: validated.address,
        city: validated.city,
        latitude: validated.latitude,
        longitude: validated.longitude,
        deliveryNotes: validated.deliveryNotes,
        isDefault: validated.isDefault ?? false,
      },
    })

    return createSecureResponse(
      {
        success: true,
        data: address,
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

    console.error('Error creating delivery address:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to create delivery address',
      },
      500
    )
  }
}

