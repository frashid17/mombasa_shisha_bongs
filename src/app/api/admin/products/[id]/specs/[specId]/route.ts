import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// PUT - Update a specification
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; specId: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { id, specId } = await params
    const body = await req.json()
    const { type, name, value, price, position, isActive } = body

    // Verify specification belongs to product
    const existingSpec = await prisma.productSpecification.findFirst({
      where: { id: specId, productId: id },
    })

    if (!existingSpec) {
      return NextResponse.json(
        { error: 'Specification not found' },
        { status: 404 }
      )
    }

    // Only allow price for Size, Weight, Volume types
    const priceAllowedTypes = ['Size', 'Weight', 'Volume']
    const finalPrice = price !== undefined 
      ? (priceAllowedTypes.includes(type || existingSpec.type) && price !== null && price !== '' 
          ? new Decimal(price)
          : null)
      : undefined

    const spec = await prisma.productSpecification.update({
      where: { id: specId },
      data: {
        ...(type && { type }),
        ...(name && { name }),
        ...(value !== undefined && { value: value || null }),
        ...(finalPrice !== undefined && { price: finalPrice }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ success: true, spec })
  } catch (error: any) {
    console.error('Error updating specification:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update specification' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specification
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; specId: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { id, specId } = await params

    // Verify specification belongs to product
    const existingSpec = await prisma.productSpecification.findFirst({
      where: { id: specId, productId: id },
    })

    if (!existingSpec) {
      return NextResponse.json(
        { error: 'Specification not found' },
        { status: 404 }
      )
    }

    await prisma.productSpecification.delete({
      where: { id: specId },
    })

    return NextResponse.json({ success: true, message: 'Specification deleted' })
  } catch (error: any) {
    console.error('Error deleting specification:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete specification' },
      { status: 500 }
    )
  }
}

