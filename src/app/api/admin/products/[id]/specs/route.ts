import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'

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
    const { type, name, value, position = 0 } = body

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

    const spec = await prisma.productSpecification.create({
      data: {
        productId: id,
        type,
        name,
        value: value || null,
        position,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, spec }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating specification:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create specification' },
      { status: 500 }
    )
  }
}

