import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'

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
    const { type, name, value, position, isActive } = body

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

    const spec = await prisma.productSpecification.update({
      where: { id: specId },
      data: {
        ...(type && { type }),
        ...(name && { name }),
        ...(value !== undefined && { value: value || null }),
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

