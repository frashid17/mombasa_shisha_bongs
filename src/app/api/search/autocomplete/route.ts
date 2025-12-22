import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Search products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        brand: true,
        images: { take: 1, select: { url: true } },
        category: { select: { name: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 3,
    })

    // Get unique brands
    const brands = await prisma.product.findMany({
      where: {
        isActive: true,
        brand: { contains: query, mode: 'insensitive', not: null },
      },
      select: { brand: true },
      distinct: ['brand'],
      take: 3,
    })

    const suggestions = [
      ...products.map((p) => ({
        type: 'product' as const,
        id: p.id,
        title: p.name,
        subtitle: p.brand || p.category?.name,
        image: p.images[0]?.url,
        url: `/products/${p.id}`,
      })),
      ...categories.map((c) => ({
        type: 'category' as const,
        id: c.id,
        title: c.name,
        subtitle: 'Category',
        url: `/categories/${c.id}`,
      })),
      ...brands
        .filter((b): b is { brand: string } => b.brand !== null)
        .map((b) => ({
          type: 'brand' as const,
        id: b.brand,
        title: b.brand,
        subtitle: 'Brand',
        url: `/products?brand=${encodeURIComponent(b.brand)}`,
      })),
    ]

    return NextResponse.json({ suggestions: suggestions.slice(0, limit) })
  } catch (error: any) {
    console.error('Search autocomplete error:', error)
    return NextResponse.json({ suggestions: [] }, { status: 500 })
  }
}

