import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// GET - List all specifications for a product
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { id } = await params

    const specs = await prisma.productSpecification.findMany({
      where: { productId: id },
      orderBy: [{ type: 'asc' }, { position: 'asc' }],
    })

    return NextResponse.json({ success: true, specs })
  } catch (error: any) {
    console.error('Error fetching specifications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch specifications' },
      { status: 500 }
    )
  }
}

// POST - Create a new specification
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { id } = await params
    const body = await req.json()
    const { type, name, value, price, position = 0 } = body

    if (!type || !name) {
      return NextResponse.json(
        { error: 'Type and name are required' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Only allow price for Size, Weight, Volume types
    const priceAllowedTypes = ['Size', 'Weight', 'Volume']
    const finalPrice = priceAllowedTypes.includes(type) && price !== null && price !== undefined 
      ? new Decimal(price)
      : null

    const spec = await prisma.productSpecification.create({
      data: {
        productId: id,
        type,
        name,
        value: value || null,
        price: finalPrice,
        position,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, spec }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating specification:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    })
    
    // Check if it's a database schema error (missing column)
    if (error?.message?.includes('Unknown argument') || error?.message?.includes('price') || error?.code === 'P2009') {
      return NextResponse.json(
        { 
          error: 'Database schema error: The price field is not available. Please run: npx prisma db push && npx prisma generate',
          details: error?.message || 'Unknown database error',
          code: error?.code
        },
        { status: 500 }
      )
    }
    
    // Handle Prisma errors
    if (error?.code) {
      return NextResponse.json(
        { 
          error: error?.message || 'Database error occurred',
          code: error?.code,
          meta: error?.meta
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to create specification',
        details: error?.toString() || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

