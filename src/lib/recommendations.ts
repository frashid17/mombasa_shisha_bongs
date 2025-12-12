import prisma from './prisma'

export async function getRecommendedProducts(productId: string, limit = 4) {
  // Get the current product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  })

  if (!product) return []

  // Strategy 1: Same category products (most relevant)
  const sameCategory = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: productId },
    },
    include: { images: { take: 1 }, category: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })

  // Strategy 2: If not enough, add products from related categories
  if (sameCategory.length < limit) {
    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        categoryId: { not: product.categoryId },
      },
      include: { images: { take: 1 }, category: true },
      take: limit - sameCategory.length,
      orderBy: { createdAt: 'desc' },
    })
    return [...sameCategory, ...related]
  }

  return sameCategory
}

export async function getCartRecommendations(cartItemIds: string[], limit = 4) {
  if (cartItemIds.length === 0) return []

  // Get categories of items in cart
  const products = await prisma.product.findMany({
    where: { id: { in: cartItemIds } },
    select: { categoryId: true },
  })

  const categoryIds = [...new Set(products.map((p) => p.categoryId))]

  // Recommend products from same categories
  const recommendations = await prisma.product.findMany({
    where: {
      categoryId: { in: categoryIds },
      isActive: true,
      id: { notIn: cartItemIds },
    },
    include: { images: { take: 1 }, category: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })

  return recommendations
}

