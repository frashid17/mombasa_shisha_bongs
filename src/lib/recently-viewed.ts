import prisma, { withRetry } from './prisma'
import { auth } from '@clerk/nextjs/server'

export async function trackProductView(productId: string, sessionId?: string) {
  try {
    const { userId } = await auth()

    await withRetry(async () => {
      await prisma.recentlyViewed.upsert({
        where: userId
          ? { userId_productId: { userId, productId } }
          : { sessionId_productId: { sessionId: sessionId || 'guest', productId } },
        create: {
          userId: userId || null,
          sessionId: userId ? null : (sessionId || 'guest'),
          productId,
          viewedAt: new Date(),
        },
        update: {
          viewedAt: new Date(),
        },
      })
    })
  } catch (error) {
    console.error('Error tracking product view:', error)
    // Silently fail - don't break the user experience
  }
}

export async function getRecentlyViewed(userId?: string, sessionId?: string, limit = 12) {
  try {
    const recentlyViewed = await withRetry(async () => {
      return await prisma.recentlyViewed.findMany({
        where: userId ? { userId } : { sessionId: sessionId || 'guest' },
        include: {
          product: {
            include: {
              images: { take: 1 },
              category: true,
            },
          },
        },
        orderBy: { viewedAt: 'desc' },
        take: limit,
      })
    })

    return recentlyViewed.map((rv) => rv.product).filter((p) => p.isActive)
  } catch (error) {
    console.error('Error getting recently viewed:', error)
    return []
  }
}

