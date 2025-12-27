import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma, { withRetry } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth'

// GET - Get single bundle
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) return user

    const { id } = await params

    const bundle = await withRetry(() =>
      prisma.productBundle.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      })
    )

    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ bundle })
  } catch (error: any) {
    console.error('Error fetching bundle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundle' },
      { status: 500 }
    )
  }
}

// PUT - Update bundle
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) return user

    const { id } = await params
    const body = await req.json()
    const { name, description, image, price, discount, isActive, items } = body

    // Check if bundle exists
    const existing = await withRetry(() =>
      prisma.productBundle.findUnique({
        where: { id },
        include: { items: true },
      })
    )

    if (!existing) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }

    // Update bundle
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (image !== undefined) updateData.image = image || null
    if (price !== undefined) updateData.price = Number(price)
    if (discount !== undefined) updateData.discount = discount ? Number(discount) : null
    if (isActive !== undefined) updateData.isActive = isActive

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await withRetry(() =>
        prisma.productBundleItem.deleteMany({
          where: { bundleId: id },
        })
      )

      // Create new items
      if (items.length > 0) {
        await withRetry(() =>
          prisma.productBundleItem.createMany({
            data: items.map((item: any) => ({
              bundleId: id,
              productId: item.productId,
              quantity: item.quantity || 1,
              colorId: item.colorId || null,
              specId: item.specId || null,
              allowColorSelection: item.allowColorSelection !== undefined ? item.allowColorSelection : true,
              allowSpecSelection: item.allowSpecSelection !== undefined ? item.allowSpecSelection : true,
            })),
          })
        )
      }
    }

    const bundle = await withRetry(() =>
      prisma.productBundle.update({
        where: { id },
        data: updateData,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      })
    )

    return NextResponse.json({ bundle })
  } catch (error: any) {
    console.error('Error updating bundle:', error)
    return NextResponse.json(
      { error: 'Failed to update bundle' },
      { status: 500 }
    )
  }
}

// DELETE - Delete bundle
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) return user

    const { id } = await params

    await withRetry(() =>
      prisma.productBundle.delete({
        where: { id },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting bundle:', error)
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    )
  }
}

