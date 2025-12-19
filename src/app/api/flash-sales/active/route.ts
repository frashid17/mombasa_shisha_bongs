import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'

// GET - Get active flash sales (public endpoint)
export async function GET() {
  try {
    const now = new Date()

    const flashSales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' }, // Soonest ending first
    })

    // Parse productIds and include product details
    const flashSalesWithProducts = await Promise.all(
      flashSales.map(async (sale) => {
        const productIds = JSON.parse(sale.productIds) as string[]
        const products = await prisma.product.findMany({
          where: { id: { in: productIds }, isActive: true },
          include: {
            images: { take: 1 },
            category: true,
          },
        })

        return {
          id: sale.id,
          title: sale.title,
          description: sale.description,
          discountPercent: Number(sale.discountPercent),
          startDate: sale.startDate,
          endDate: sale.endDate,
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            images: p.images,
            category: p.category,
            stock: p.stock,
          })),
        }
      })
    )

    return createSecureResponse({
      success: true,
      data: flashSalesWithProducts,
    })
  } catch (error: any) {
    console.error('Error fetching active flash sales:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to fetch active flash sales',
      },
      500
    )
  }
}

