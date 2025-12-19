/**
 * Database Cleanup Script
 * 
 * This script deletes all products and orders from the database.
 * Use this for test data cleanup.
 * 
 * Usage:
 *   npx tsx scripts/cleanup-database.ts
 * 
 * Or with Node:
 *   npx ts-node scripts/cleanup-database.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  try {
    console.log('🔄 Starting database cleanup...\n')

    // Get counts before deletion
    const orderCount = await prisma.order.count()
    const productCount = await prisma.product.count()
    const orderItemCount = await prisma.orderItem.count()
    const productImageCount = await prisma.productImage.count()
    const flashSaleCount = await prisma.flashSale.count()

    console.log('📊 Current data counts:')
    console.log(`   - Orders: ${orderCount}`)
    console.log(`   - Products: ${productCount}`)
    console.log(`   - Order Items: ${orderItemCount}`)
    console.log(`   - Product Images: ${productImageCount}`)
    console.log(`   - Flash Sales: ${flashSaleCount}\n`)

    if (orderCount === 0 && productCount === 0) {
      console.log('✅ Database is already empty. Nothing to delete.')
      await prisma.$disconnect()
      return
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      console.log('🗑️  Deleting orders...')
      await tx.order.deleteMany({})
      console.log('   ✓ Orders deleted')

      console.log('🗑️  Deleting products...')
      await tx.product.deleteMany({})
      console.log('   ✓ Products deleted')

      console.log('🗑️  Deleting flash sales...')
      await tx.flashSale.deleteMany({})
      console.log('   ✓ Flash sales deleted')

      console.log('🗑️  Deleting related data...')
      await tx.wishlistShare.deleteMany({})
      await tx.recentlyViewed.deleteMany({})
      await tx.savedCartItem.deleteMany({})
      await tx.stockNotification.deleteMany({})
      await tx.savedSearch.deleteMany({})
      console.log('   ✓ Related data deleted')
    })

    console.log('\n✅ Database cleanup completed successfully!')
    console.log(`   Deleted ${orderCount} orders and ${productCount} products.`)
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run cleanup
cleanup()

