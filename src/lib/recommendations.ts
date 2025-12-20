import prisma from './prisma'

export async function getRecommendedProducts(productId: string, limit = 4) {
  // Get the current product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  })

  if (!product) return []

  // Strategy 1: Same category products (most relevant)
  // Only if product has a category
  const sameCategory = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          id: { not: productId },
        },
        include: { images: { take: 1 }, category: true },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    : []

  // Strategy 2: If not enough, add products from related categories
  if (sameCategory.length < limit) {
    const relatedWhere: any = {
      isActive: true,
      id: { not: productId },
    }
    
    // Only exclude current category if it exists
    if (product.categoryId) {
      relatedWhere.categoryId = { not: product.categoryId }
    }
    
    const related = await prisma.product.findMany({
      where: relatedWhere,
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

  const categoryIds = [...new Set(products.map((p) => p.categoryId).filter((id): id is string => id !== null))]

  // If no valid category IDs, return empty array
  if (categoryIds.length === 0) return []

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

/**
 * Get "Frequently Bought Together" products based on order history
 * Finds products that are commonly purchased together with the given product
 */
export async function getFrequentlyBoughtTogether(productId: string, limit = 4) {
  // Get all orders that contain this product
  const ordersWithProduct = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
    distinct: ['orderId'],
  })

  if (ordersWithProduct.length === 0) {
    // Fallback to category-based recommendations
    return getRecommendedProducts(productId, limit)
  }

  const orderIds = ordersWithProduct.map((item) => item.orderId)

  // Get all other products in those orders
  const otherProducts = await prisma.orderItem.findMany({
    where: {
      orderId: { in: orderIds },
      productId: { not: productId },
    },
    select: {
      productId: true,
      quantity: true,
    },
  })

  // Count how many times each product appears with the given product
  const productCounts = new Map<string, number>()
  otherProducts.forEach((item) => {
    const count = productCounts.get(item.productId) || 0
    productCounts.set(item.productId, count + item.quantity)
  })

  // Sort by frequency and get top products
  const sortedProducts = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId]) => productId)

  if (sortedProducts.length === 0) {
    return getRecommendedProducts(productId, limit)
  }

  // Get full product details
  const frequentlyBought = await prisma.product.findMany({
    where: {
      id: { in: sortedProducts },
      isActive: true,
    },
    include: { images: { take: 1 }, category: true },
  })

  // Sort to match the frequency order
  const sorted = sortedProducts
    .map((id) => frequentlyBought.find((p) => p.id === id))
    .filter((p): p is typeof frequentlyBought[0] => p !== undefined)

  // If we don't have enough, fill with category recommendations
  if (sorted.length < limit) {
    const categoryRecs = await getRecommendedProducts(productId, limit - sorted.length)
    const categoryRecsFiltered = categoryRecs.filter(
      (p) => !sorted.some((s) => s.id === p.id)
    )
    return [...sorted, ...categoryRecsFiltered].slice(0, limit)
  }

  return sorted
}

