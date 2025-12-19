import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { updateProductSchema } from '@/utils/validations'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true, reviews: true },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { images, ...productData } = body
    const data = updateProductSchema.parse(productData)

    // Update product and handle images
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        // Delete existing images and create new ones
        images: {
          deleteMany: {},
          create: (images || []).map((img: any, index: number) => ({
            url: img.url,
            altText: img.altText || '',
            position: img.position ?? index,
            isPrimary: img.isPrimary || (index === 0 && !images.some((i: any) => i.isPrimary)),
          })),
        },
      },
      include: { category: true, images: true },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    
    // Check if product has order items (which would prevent deletion)
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    })

    if (orderItemCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete product: It has ${orderItemCount} order item(s) associated with it. Please delete the related orders first.` 
        },
        { status: 400 }
      )
    }

    // Delete the product (ProductImage, StockNotification, SavedSearch, etc. will cascade automatically per schema)
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Handle foreign key constraint errors
    if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Cannot delete product: It is referenced by existing orders or other records. Please delete related records first.' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 })
  }
}

