import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const flashSaleUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  productIds: z.array(z.string()).min(1).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
})

// GET - Get a specific flash sale
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

    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
    })

    if (!flashSale) {
      return createSecureResponse(
        { success: false, error: 'Flash sale not found' },
        404
      )
    }

    return createSecureResponse({
      success: true,
      data: {
        ...flashSale,
        productIds: JSON.parse(flashSale.productIds),
        discountPercent: Number(flashSale.discountPercent),
      },
    })
  } catch (error: any) {
    console.error('Error fetching flash sale:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to fetch flash sale',
      },
      500
    )
  }
}

// PUT - Update a flash sale
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

    const existing = await prisma.flashSale.findUnique({
      where: { id },
    })

    if (!existing) {
      return createSecureResponse(
        { success: false, error: 'Flash sale not found' },
        404
      )
    }

    const body = await req.json()
    const validated = flashSaleUpdateSchema.parse(body)

    // Validate dates if both are provided
    if (validated.startDate && validated.endDate) {
      if (validated.endDate <= validated.startDate) {
        return createSecureResponse(
          { success: false, error: 'End date must be after start date' },
          400
        )
      }
    } else if (validated.startDate && existing.endDate) {
      if (existing.endDate <= validated.startDate) {
        return createSecureResponse(
          { success: false, error: 'End date must be after start date' },
          400
        )
      }
    } else if (validated.endDate && existing.startDate) {
      if (validated.endDate <= existing.startDate) {
        return createSecureResponse(
          { success: false, error: 'End date must be after start date' },
          400
        )
      }
    }

    // Validate products if productIds is provided
    if (validated.productIds) {
      const products = await prisma.product.findMany({
        where: { id: { in: validated.productIds } },
      })

      if (products.length !== validated.productIds.length) {
        return createSecureResponse(
          { success: false, error: 'One or more products not found' },
          400
        )
      }
    }

    const updateData: any = {}
    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.description !== undefined) updateData.description = validated.description || null
    if (validated.productIds !== undefined) updateData.productIds = JSON.stringify(validated.productIds)
    if (validated.discountPercent !== undefined) updateData.discountPercent = new Decimal(validated.discountPercent)
    if (validated.startDate !== undefined) updateData.startDate = validated.startDate
    if (validated.endDate !== undefined) updateData.endDate = validated.endDate
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive

    const flashSale = await prisma.flashSale.update({
      where: { id },
      data: updateData,
    })

    return createSecureResponse({
      success: true,
      data: {
        ...flashSale,
        productIds: validated.productIds || JSON.parse(flashSale.productIds),
        discountPercent: validated.discountPercent !== undefined 
          ? validated.discountPercent 
          : Number(flashSale.discountPercent),
      },
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

    console.error('Error updating flash sale:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to update flash sale',
      },
      500
    )
  }
}

// DELETE - Delete a flash sale
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

    const existing = await prisma.flashSale.findUnique({
      where: { id },
    })

    if (!existing) {
      return createSecureResponse(
        { success: false, error: 'Flash sale not found' },
        404
      )
    }

    await prisma.flashSale.delete({
      where: { id },
    })

    return createSecureResponse({
      success: true,
      message: 'Flash sale deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting flash sale:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to delete flash sale',
      },
      500
    )
  }
}

