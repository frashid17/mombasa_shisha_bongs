import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma, { withRetry } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth'

// GET - List all bundles
export async function GET() {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) return user

    const bundles = await withRetry(() =>
      prisma.productBundle.findMany({
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                  colors: true,
                  specifications: true,
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

    return NextResponse.json({ bundles })
  } catch (error: any) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
}

// POST - Create new bundle
export async function POST(req: Request) {
  try {
    const user = await requireAdmin()
    if (user instanceof Response) return user

    const body = await req.json()
    const { name, description, image, price, discount, isActive = true, items } = body

    if (!name || !price || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Name, price, and at least one item are required' },
        { status: 400 }
      )
    }

    // Calculate total individual price for validation
    const productIds = items.map((item: any) => item.productId)
    const products = await withRetry(() =>
      prisma.product.findMany({
        where: { id: { in: productIds } },
      })
    )

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found' },
        { status: 400 }
      )
    }

    const totalIndividualPrice = items.reduce((sum: number, item: any) => {
      const product = products.find((p) => p.id === item.productId)
      return sum + Number(product?.price || 0) * (item.quantity || 1)
    }, 0)

    // Create bundle
    const bundle = await withRetry(() =>
      prisma.productBundle.create({
        data: {
          name,
          description,
          image: image || null,
          price: Number(price),
          discount: discount ? Number(discount) : totalIndividualPrice - Number(price),
          isActive,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity || 1,
              colorId: item.colorId || null,
              specId: item.specId || null,
              allowColorSelection: item.allowColorSelection !== undefined ? item.allowColorSelection : true,
              allowSpecSelection: item.allowSpecSelection !== undefined ? item.allowSpecSelection : true,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    )

    return NextResponse.json({ bundle }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating bundle:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    return NextResponse.json(
      { 
        error: 'Failed to create bundle',
        details: error?.message || 'Unknown error',
        code: error?.code,
      },
      { status: 500 }
    )
  }
}

