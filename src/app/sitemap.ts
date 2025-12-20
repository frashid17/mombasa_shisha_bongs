import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/tips/top-shisha-products-2024`,
      lastModified: new Date('2025-12-20'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/tips/choose-right-vape-kit`,
      lastModified: new Date('2025-12-20'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/tips/shisha-maintenance-guide`,
      lastModified: new Date('2025-12-20'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  try {
    // Dynamic product pages
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000, // Limit to prevent timeout
    })

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Dynamic category pages
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        updatedAt: true,
      },
    })

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${siteUrl}/categories/${category.id}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...productPages, ...categoryPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages only if database query fails
    return staticPages
  }
}

