import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { serializeProducts } from '@/lib/prisma-serialize'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find orders that contain this product
    const ordersWithProduct = await prisma.orderItem.findMany({
      where: { productId: id },
      select: { orderId: true },
      distinct: ['orderId'],
      take: 50, // Limit to recent orders
    })

    if (ordersWithProduct.length === 0) {
      return NextResponse.json({ success: true, products: [] })
    }

    const orderIds = ordersWithProduct.map((item) => item.orderId)

    // Find other products bought in the same orders
    const alsoBoughtItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        orderId: { in: orderIds },
        productId: { not: id }, // Exclude the current product
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 8,
    })

    if (alsoBoughtItems.length === 0) {
      return NextResponse.json({ success: true, products: [] })
    }

    const productIds = alsoBoughtItems.map((item) => item.productId)

    // Fetch the products with their details
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        images: { take: 1 },
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
    })

    // Sort products by frequency (how often they were bought together)
    const productFrequencyMap = new Map(
      alsoBoughtItems.map((item) => [item.productId, item._count.productId])
    )

    const sortedProducts = products.sort((a, b) => {
      const aFreq = productFrequencyMap.get(a.id) || 0
      const bFreq = productFrequencyMap.get(b.id) || 0
      return bFreq - aFreq
    })

    // Calculate ratings
    const productsWithRatings = sortedProducts.map((p) => {
      const ratings = p.reviews.map((r) => r.rating)
      const reviewCount = ratings.length
      const averageRating = reviewCount > 0 ? ratings.reduce((sum, r) => sum + r, 0) / reviewCount : undefined
      return {
        ...p,
        averageRating,
        reviewCount,
      }
    })

    return NextResponse.json({
      success: true,
      products: serializeProducts(productsWithRatings),
    })
  } catch (error: any) {
    console.error('Error fetching also bought products:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

