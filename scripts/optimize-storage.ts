/**
 * Storage Optimization Script
 * Run this periodically to clean up old data and optimize storage
 * 
 * Usage: npx tsx scripts/optimize-storage.ts
 */

import prisma from '../src/lib/prisma'

async function optimizeStorage() {
  console.log('🧹 Starting storage optimization...\n')

  try {
    // 1. Clean up old notifications (older than 90 days, already sent/delivered/failed)
    console.log('📧 Cleaning up old notifications...')
    const notificationCutoff = new Date()
    notificationCutoff.setDate(notificationCutoff.getDate() - 90)
    
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: notificationCutoff },
        status: { in: ['SENT', 'DELIVERED', 'FAILED'] },
      },
    })
    console.log(`   ✓ Deleted ${deletedNotifications.count} old notifications`)

    // 2. Clean up old admin logs (older than 90 days)
    console.log('📝 Cleaning up old admin logs...')
    const logCutoff = new Date()
    logCutoff.setDate(logCutoff.getDate() - 90)
    
    const deletedLogs = await prisma.adminLog.deleteMany({
      where: {
        createdAt: { lt: logCutoff },
      },
    })
    console.log(`   ✓ Deleted ${deletedLogs.count} old admin logs`)

    // 3. Clean up old recently viewed (older than 30 days)
    console.log('👁️  Cleaning up old recently viewed items...')
    const recentlyViewedCutoff = new Date()
    recentlyViewedCutoff.setDate(recentlyViewedCutoff.getDate() - 30)
    
    const deletedRecentlyViewed = await prisma.recentlyViewed.deleteMany({
      where: {
        viewedAt: { lt: recentlyViewedCutoff },
      },
    })
    console.log(`   ✓ Deleted ${deletedRecentlyViewed.count} old recently viewed items`)

    // 4. Clean up old saved cart items (older than 60 days)
    console.log('🛒 Cleaning up old saved cart items...')
    const savedCartCutoff = new Date()
    savedCartCutoff.setDate(savedCartCutoff.getDate() - 60)
    
    const deletedSavedCarts = await prisma.savedCartItem.deleteMany({
      where: {
        createdAt: { lt: savedCartCutoff },
      },
    })
    console.log(`   ✓ Deleted ${deletedSavedCarts.count} old saved cart items`)

    // 5. Clean up old stock notifications (notified, older than 30 days)
    console.log('📦 Cleaning up old stock notifications...')
    const stockNotificationCutoff = new Date()
    stockNotificationCutoff.setDate(stockNotificationCutoff.getDate() - 30)
    
    const deletedStockNotifications = await prisma.stockNotification.deleteMany({
      where: {
        notified: true,
        notifiedAt: { lt: stockNotificationCutoff },
      },
    })
    console.log(`   ✓ Deleted ${deletedStockNotifications.count} old stock notifications`)

    // 6. Vacuum/optimize database (PostgreSQL)
    console.log('\n🔧 Optimizing database...')
    try {
      await prisma.$executeRaw`VACUUM ANALYZE`
      console.log('   ✓ Database vacuumed and analyzed')
    } catch (error) {
      console.log('   ⚠️  VACUUM not available (may require superuser)')
    }

    // Calculate estimated savings
    const estimatedSavings = {
      notifications: deletedNotifications.count * 0.5,
      adminLogs: deletedLogs.count * 1,
      recentlyViewed: deletedRecentlyViewed.count * 0.1,
      savedCarts: deletedSavedCarts.count * 0.3,
      stockNotifications: deletedStockNotifications.count * 0.2,
    }

    const totalKB = Object.values(estimatedSavings).reduce((a, b) => a + b, 0)
    const totalMB = (totalKB / 1024).toFixed(2)

    console.log('\n✅ Storage optimization completed!')
    console.log(`\n📊 Estimated storage saved: ${totalMB} MB`)
    console.log('\nBreakdown:')
    console.log(`   - Notifications: ${(estimatedSavings.notifications / 1024).toFixed(2)} MB`)
    console.log(`   - Admin Logs: ${(estimatedSavings.adminLogs / 1024).toFixed(2)} MB`)
    console.log(`   - Recently Viewed: ${(estimatedSavings.recentlyViewed / 1024).toFixed(2)} MB`)
    console.log(`   - Saved Carts: ${(estimatedSavings.savedCarts / 1024).toFixed(2)} MB`)
    console.log(`   - Stock Notifications: ${(estimatedSavings.stockNotifications / 1024).toFixed(2)} MB`)
  } catch (error) {
    console.error('❌ Error during optimization:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run optimization
optimizeStorage()

