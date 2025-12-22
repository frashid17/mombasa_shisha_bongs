import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/auth'
import prisma from '@/lib/prisma'

/**
 * Cleanup old data to save storage
 * This endpoint can be called periodically (e.g., via cron job)
 */
export async function POST(req: Request) {
  try {
    // Check if user is admin
    const admin = await requireAdmin()
    if (admin instanceof Response) {
      return admin // Return error response
    }

    const body = await req.json()
    const {
      deleteOldNotifications = true,
      deleteOldAdminLogs = true,
      deleteOldRecentlyViewed = true,
      deleteOldSavedCarts = true,
      deleteOldStockNotifications = true,
      archiveOldOrders = false, // Archive instead of delete
      daysToKeep = 90, // Default: keep last 90 days
    } = body

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const results: any = {}

    // 1. Delete old notifications (keep last 90 days)
    if (deleteOldNotifications) {
      const deleted = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: { in: ['SENT', 'DELIVERED', 'FAILED'] }, // Don't delete pending
        },
      })
      results.notificationsDeleted = deleted.count
    }

    // 2. Delete old admin logs (keep last 90 days)
    if (deleteOldAdminLogs) {
      const deleted = await prisma.adminLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      })
      results.adminLogsDeleted = deleted.count
    }

    // 3. Delete old recently viewed (keep last 30 days)
    if (deleteOldRecentlyViewed) {
      const recentlyViewedCutoff = new Date()
      recentlyViewedCutoff.setDate(recentlyViewedCutoff.getDate() - 30)
      
      const deleted = await prisma.recentlyViewed.deleteMany({
        where: {
          viewedAt: { lt: recentlyViewedCutoff },
        },
      })
      results.recentlyViewedDeleted = deleted.count
    }

    // 4. Delete old saved cart items (keep last 60 days)
    if (deleteOldSavedCarts) {
      const savedCartCutoff = new Date()
      savedCartCutoff.setDate(savedCartCutoff.getDate() - 60)
      
      const deleted = await prisma.savedCartItem.deleteMany({
        where: {
          createdAt: { lt: savedCartCutoff },
        },
      })
      results.savedCartItemsDeleted = deleted.count
    }

    // 5. Delete notified stock notifications (keep un-notified ones)
    if (deleteOldStockNotifications) {
      const stockNotificationCutoff = new Date()
      stockNotificationCutoff.setDate(stockNotificationCutoff.getDate() - 30)
      
      const deleted = await prisma.stockNotification.deleteMany({
        where: {
          notified: true,
          notifiedAt: { lt: stockNotificationCutoff },
        },
      })
      results.stockNotificationsDeleted = deleted.count
    }

    // 6. Archive old completed orders (optional - move to separate table or mark as archived)
    if (archiveOldOrders) {
      const orderCutoff = new Date()
      orderCutoff.setDate(orderCutoff.getDate() - 365) // Archive orders older than 1 year
      
      // For now, we'll just mark them - you can create an archived_orders table later
      const archived = await prisma.order.updateMany({
        where: {
          createdAt: { lt: orderCutoff },
          status: { in: ['DELIVERED', 'CANCELLED', 'REFUNDED'] },
        },
        data: {
          // Add archived flag if you add it to schema
        },
      })
      results.ordersArchived = archived.count
    }

    // Calculate storage saved (rough estimate)
    const estimatedSavings = {
      notifications: results.notificationsDeleted * 0.5, // ~0.5KB per notification
      adminLogs: results.adminLogsDeleted * 1, // ~1KB per log
      recentlyViewed: results.recentlyViewedDeleted * 0.1, // ~0.1KB per view
      savedCarts: results.savedCartItemsDeleted * 0.3, // ~0.3KB per item
      stockNotifications: results.stockNotificationsDeleted * 0.2, // ~0.2KB per notification
    }

    const totalSavingsKB = Object.values(estimatedSavings).reduce((a, b) => a + b, 0)
    const totalSavingsMB = (totalSavingsKB / 1024).toFixed(2)

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Estimated storage saved: ${totalSavingsMB} MB`,
      deleted: results,
      estimatedSavings: {
        ...estimatedSavings,
        totalKB: totalSavingsKB.toFixed(2),
        totalMB: totalSavingsMB,
      },
    })
  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to cleanup data',
        message: 'An error occurred during cleanup.',
      },
      { status: 500 }
    )
  }
}

