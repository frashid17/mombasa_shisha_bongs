import { NextResponse } from 'next/server'
import prisma, { withRetry } from '@/lib/prisma'

// GET - Get active bundles for customers
export async function GET() {
  try {
    const bundles = await withRetry(() =>
      prisma.productBundle.findMany({
        where: { isActive: true },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                  colors: { where: { isActive: true } },
                  specifications: { where: { isActive: true } },
                  category: true,
                },
              },
              color: true,
              specification: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({
      bundles: bundles.map((bundle) => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        image: bundle.image,
        price: Number(bundle.price),
        discount: bundle.discount ? Number(bundle.discount) : null,
        items: bundle.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          colorId: item.colorId,
          specId: item.specId,
          allowColorSelection: item.allowColorSelection,
          allowSpecSelection: item.allowSpecSelection,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.images[0]?.url || item.product.featuredImage,
            slug: item.product.slug,
            colors: item.product.colors,
            specifications: item.product.specifications,
          },
          preselectedColor: item.color,
          preselectedSpec: item.specification,
        })),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
}

