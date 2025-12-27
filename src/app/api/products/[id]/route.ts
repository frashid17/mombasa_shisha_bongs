import { NextResponse } from 'next/server'
import prisma, { withRetry } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await withRetry(() =>
      prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { position: 'asc' },
          },
          colors: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          },
          specifications: {
            where: { isActive: true },
            orderBy: [{ position: 'asc' }, { type: 'asc' }],
          },
        },
      })
    )

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      featuredImage: product.featuredImage,
      images: product.images,
      category: product.category,
      colors: product.colors,
      specifications: product.specifications,
    })
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

