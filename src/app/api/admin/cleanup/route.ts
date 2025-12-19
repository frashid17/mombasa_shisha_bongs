import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

/**
 * DELETE /api/admin/cleanup
 * 
 * Deletes all products and orders from the database.
 * This is a destructive operation and should only be used for test data cleanup.
 * 
 * Requires authentication and explicit confirmation.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { confirm } = body

    // Require explicit confirmation
    if (confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json(
        { 
          error: 'Confirmation required. Send { "confirm": "DELETE_ALL_DATA" } to proceed.',
          message: 'This will delete ALL products and orders. This action cannot be undone.'
        },
        { status: 400 }
      )
    }

    // Start transaction to delete everything
    const result = await prisma.$transaction(async (tx) => {
      // Get counts before deletion for reporting
      const orderCount = await tx.order.count()
      const productCount = await tx.product.count()
      const orderItemCount = await tx.orderItem.count()
      const productImageCount = await tx.productImage.count()

      // Delete orders first (this will cascade delete order items)
      await tx.order.deleteMany({})

      // Delete products (this will cascade delete product images, stock notifications, etc.)
      await tx.product.deleteMany({})

      // Also delete other related data
      await tx.flashSale.deleteMany({})
      await tx.wishlistShare.deleteMany({})
      await tx.recentlyViewed.deleteMany({})
      await tx.savedCartItem.deleteMany({})
      await tx.stockNotification.deleteMany({})
      await tx.savedSearch.deleteMany({})

      return {
        ordersDeleted: orderCount,
        productsDeleted: productCount,
        orderItemsDeleted: orderItemCount,
        productImagesDeleted: productImageCount,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'All products and orders have been deleted successfully.',
      deleted: result,
    })
  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete data',
        message: 'An error occurred while deleting data. Please try again.'
      },
      { status: 500 }
    )
  }
}

