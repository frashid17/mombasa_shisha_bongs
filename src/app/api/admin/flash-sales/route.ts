import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const flashSaleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  productIds: z.array(z.string()).min(1, 'At least one product is required'),
  discountPercent: z.number().min(0).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().optional().default(true),
})

// GET - Get all flash sales
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createSecureResponse(
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    // Check if user is admin (you may want to add role check here)
    const flashSales = await prisma.flashSale.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Parse productIds JSON strings
    const flashSalesWithParsed = flashSales.map((sale) => ({
      ...sale,
      productIds: JSON.parse(sale.productIds),
      discountPercent: Number(sale.discountPercent),
    }))

    return createSecureResponse({
      success: true,
      data: flashSalesWithParsed,
    })
  } catch (error: any) {
    console.error('Error fetching flash sales:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to fetch flash sales',
      },
      500
    )
  }
}

// POST - Create a new flash sale
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
    const validated = flashSaleSchema.parse(body)

    // Validate dates
    if (validated.endDate <= validated.startDate) {
      return createSecureResponse(
        { success: false, error: 'End date must be after start date' },
        400
      )
    }

    // Validate products exist
    const products = await prisma.product.findMany({
      where: { id: { in: validated.productIds } },
    })

    if (products.length !== validated.productIds.length) {
      return createSecureResponse(
        { success: false, error: 'One or more products not found' },
        400
      )
    }

    const flashSale = await prisma.flashSale.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        productIds: JSON.stringify(validated.productIds),
        discountPercent: new Decimal(validated.discountPercent),
        startDate: validated.startDate,
        endDate: validated.endDate,
        isActive: validated.isActive ?? true,
      },
    })

    return createSecureResponse(
      {
        success: true,
        data: {
          ...flashSale,
          productIds: validated.productIds,
          discountPercent: validated.discountPercent,
        },
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

    console.error('Error creating flash sale:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to create flash sale',
      },
      500
    )
  }
}

