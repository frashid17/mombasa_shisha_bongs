import { NextResponse } from 'next/server'
import prisma, { withRetry } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await withRetry(() =>
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          colors: true,
          specifications: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        featuredImage: product.featuredImage,
        image: product.images[0]?.url || product.featuredImage,
        category: product.category,
        colors: product.colors,
        specifications: product.specifications.map((spec: any) => ({
          id: spec.id,
          type: spec.type,
          name: spec.name,
          value: spec.value,
          price: spec.price ? Number(spec.price) : null,
          isActive: spec.isActive,
        })),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

