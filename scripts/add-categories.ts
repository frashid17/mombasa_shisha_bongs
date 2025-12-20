import { PrismaClient } from '../src/generated/prisma'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Shisha Flavor',
    slug: 'shisha-flavor',
    description: 'Premium shisha flavors and tobacco',
    image: 'https://images.unsplash.com/photo-1548595165-c96277dfa6d3?w=800&h=600&fit=crop&q=80',
  },
  {
    name: 'Disposable Vapes',
    slug: 'disposable-vapes',
    description: 'Convenient disposable vape devices',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80',
  },
  {
    name: 'Shisha & Hookah',
    slug: 'shisha-hookah',
    description: 'Premium shisha pipes and hookahs',
    image: 'https://images.unsplash.com/photo-1761839257287-3030c9300ece?w=800&h=600&fit=crop&q=80',
  },
  {
    name: 'Shisha Accessories',
    slug: 'shisha-accessories',
    description: 'Essential shisha accessories and parts',
    image: 'https://images.unsplash.com/photo-1591522810163-d1e3cbf1c888?w=800&h=600&fit=crop&q=80',
  },
  {
    name: 'Coals',
    slug: 'coals',
    description: 'Premium shisha coals and charcoal',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80',
  },
  {
    name: 'Refillable Vapes',
    slug: 'refillable-vapes',
    description: 'Refillable vape kits and devices',
    image: 'https://images.unsplash.com/photo-1555697863-80a30c6e4bc1?w=800&h=600&fit=crop&q=80',
  },
  {
    name: 'E-Liquids',
    slug: 'e-liquids',
    description: 'Premium e-liquids and vape juices',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80',
  },
]

async function main() {
  console.log('🌱 Adding categories...')

  for (const categoryData of categories) {
    try {
      // Check if category already exists
      const existing = await prisma.category.findUnique({
        where: { slug: categoryData.slug },
      })

      if (existing) {
        console.log(`⏭️  Category "${categoryData.name}" already exists, skipping...`)
        continue
      }

      const category = await prisma.category.create({
        data: {
          ...categoryData,
          isActive: true,
        },
      })

      console.log(`✅ Created category: ${category.name}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Category "${categoryData.name}" already exists (unique constraint), skipping...`)
      } else {
        console.error(`❌ Error creating category "${categoryData.name}":`, error.message)
      }
    }
  }

  console.log('✅ Categories added successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

