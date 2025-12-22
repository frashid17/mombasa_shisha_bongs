import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'

/**
 * Get storage statistics
 */
export async function GET() {
  try {
    // Check if user is admin
    const admin = await requireAdmin()
    if (admin instanceof Response) {
      return admin // Return error response
    }

    // Get counts for all major tables
    const [
      products,
      orders,
      orderItems,
      reviews,
      notifications,
      adminLogs,
      recentlyViewed,
      savedCartItems,
      stockNotifications,
      productImages,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.orderItem.count(),
      prisma.review.count(),
      prisma.notification.count(),
      prisma.adminLog.count(),
      prisma.recentlyViewed.count(),
      prisma.savedCartItem.count(),
      prisma.stockNotification.count(),
      prisma.productImage.count(),
    ])

    // Get old data counts (older than 90 days)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)

    const [
      oldNotifications,
      oldAdminLogs,
      oldRecentlyViewed,
      oldSavedCarts,
    ] = await Promise.all([
      prisma.notification.count({
        where: {
          createdAt: { lt: cutoffDate },
          status: { in: ['SENT', 'DELIVERED', 'FAILED'] },
        },
      }),
      prisma.adminLog.count({
        where: { createdAt: { lt: cutoffDate } },
      }),
      prisma.recentlyViewed.count({
        where: { viewedAt: { lt: cutoffDate } },
      }),
      prisma.savedCartItem.count({
        where: { createdAt: { lt: cutoffDate } },
      }),
    ])

    // Estimate storage (rough calculations)
    const estimates = {
      products: products * 2, // ~2KB per product
      orders: orders * 1.5, // ~1.5KB per order
      orderItems: orderItems * 0.5, // ~0.5KB per item
      reviews: reviews * 0.8, // ~0.8KB per review
      notifications: notifications * 0.5, // ~0.5KB per notification
      adminLogs: adminLogs * 1, // ~1KB per log
      recentlyViewed: recentlyViewed * 0.1, // ~0.1KB per view
      savedCartItems: savedCartItems * 0.3, // ~0.3KB per item
      stockNotifications: stockNotifications * 0.2, // ~0.2KB per notification
      productImages: productImages * 0.2, // ~0.2KB per image record
    }

    const totalKB = Object.values(estimates).reduce((a, b) => a + b, 0)
    const totalMB = (totalKB / 1024).toFixed(2)
    const totalGB = (totalKB / 1024 / 1024).toFixed(3)

    // Calculate potential savings
    const potentialSavings = {
      notifications: oldNotifications * 0.5,
      adminLogs: oldAdminLogs * 1,
      recentlyViewed: oldRecentlyViewed * 0.1,
      savedCarts: oldSavedCarts * 0.3,
    }

    const savingsKB = Object.values(potentialSavings).reduce((a, b) => a + b, 0)
    const savingsMB = (savingsKB / 1024).toFixed(2)

    return NextResponse.json({
      success: true,
      stats: {
        counts: {
          products,
          orders,
          orderItems,
          reviews,
          notifications,
          adminLogs,
          recentlyViewed,
          savedCartItems,
          stockNotifications,
          productImages,
        },
        oldData: {
          notifications: oldNotifications,
          adminLogs: oldAdminLogs,
          recentlyViewed: oldRecentlyViewed,
          savedCarts: oldSavedCarts,
        },
        storage: {
          totalKB: totalKB.toFixed(2),
          totalMB,
          totalGB,
          breakdown: {
            products: (estimates.products / 1024).toFixed(2) + ' MB',
            orders: (estimates.orders / 1024).toFixed(2) + ' MB',
            orderItems: (estimates.orderItems / 1024).toFixed(2) + ' MB',
            reviews: (estimates.reviews / 1024).toFixed(2) + ' MB',
            notifications: (estimates.notifications / 1024).toFixed(2) + ' MB',
            adminLogs: (estimates.adminLogs / 1024).toFixed(2) + ' MB',
            recentlyViewed: (estimates.recentlyViewed / 1024).toFixed(2) + ' MB',
            savedCartItems: (estimates.savedCartItems / 1024).toFixed(2) + ' MB',
            stockNotifications: (estimates.stockNotifications / 1024).toFixed(2) + ' MB',
            productImages: (estimates.productImages / 1024).toFixed(2) + ' MB',
          },
        },
        potentialSavings: {
          totalKB: savingsKB.toFixed(2),
          totalMB: savingsMB,
          message: `You can free up ~${savingsMB} MB by cleaning old data`,
        },
      },
    })
  } catch (error: any) {
    console.error('Storage stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get storage stats' },
      { status: 500 }
    )
  }
}

