import { PrismaClient } from '../src/generated/prisma'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

// Old categories to remove (from seed file)
const oldCategories = [
  'Shisha Hookahs',
  'Vapes',
  'Tobacco',
  'Accessories',
]

async function main() {
  console.log('🗑️  Removing old/duplicate categories...')

  for (const categoryName of oldCategories) {
    try {
      const category = await prisma.category.findUnique({
        where: { name: categoryName },
        include: {
          products: true,
        },
      })

      if (!category) {
        console.log(`⏭️  Category "${categoryName}" not found, skipping...`)
        continue
      }

      // Check if category has products
      if (category.products.length > 0) {
        console.log(`⚠️  Category "${categoryName}" has ${category.products.length} products. Skipping deletion.`)
        console.log(`   Please reassign these products to new categories first.`)
        continue
      }

      // Delete the category
      await prisma.category.delete({
        where: { name: categoryName },
      })

      console.log(`✅ Deleted category: ${categoryName}`)
    } catch (error: any) {
      console.error(`❌ Error deleting category "${categoryName}":`, error.message)
    }
  }

  console.log('✅ Old categories removal completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

