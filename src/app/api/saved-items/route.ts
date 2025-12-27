import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma, { withRetry } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Get or create session ID for guest users
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('session_id')?.value
  
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }
  
  return sessionId
}

// GET - Fetch saved items
export async function GET() {
  try {
    const { userId } = await auth()
    const sessionId = await getSessionId()

    const savedItems = await withRetry(() =>
      prisma.savedCartItem.findMany({
        where: userId ? { userId } : { sessionId },
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({
      savedItems: savedItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          featuredImage: item.product.featuredImage,
          image: item.product.images[0]?.url || item.product.featuredImage,
          slug: item.product.slug,
        },
        createdAt: item.createdAt,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching saved items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved items' },
      { status: 500 }
    )
  }
}

// POST - Save item for later
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const sessionId = await getSessionId()
    const body = await req.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await withRetry(() =>
      prisma.product.findUnique({
        where: { id: productId },
      })
    )

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if already saved
    const existing = await withRetry(() =>
      prisma.savedCartItem.findFirst({
        where: userId
          ? { userId, productId }
          : { sessionId, productId },
      })
    )

    if (existing) {
      // Update quantity
      const updated = await withRetry(() =>
        prisma.savedCartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        })
      )

      return NextResponse.json({
        savedItem: {
          id: updated.id,
          productId: updated.productId,
          quantity: updated.quantity,
        },
      })
    }

    // Create new saved item
    const savedItem = await withRetry(() =>
      prisma.savedCartItem.create({
        data: {
          userId: userId || null,
          sessionId: userId ? null : sessionId,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      })
    )

    return NextResponse.json({
      savedItem: {
        id: savedItem.id,
        productId: savedItem.productId,
        quantity: savedItem.quantity,
        product: {
          id: savedItem.product.id,
          name: savedItem.product.name,
          price: Number(savedItem.product.price),
          image: savedItem.product.images[0]?.url || savedItem.product.featuredImage,
        },
      },
    })
  } catch (error: any) {
    console.error('Error saving item:', error)
    return NextResponse.json(
      { error: 'Failed to save item' },
      { status: 500 }
    )
  }
}

// DELETE - Remove saved item
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    const sessionId = await getSessionId()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const productId = searchParams.get('productId')

    if (!id && !productId) {
      return NextResponse.json(
        { error: 'ID or productId is required' },
        { status: 400 }
      )
    }

    const where = id
      ? { id }
      : userId
      ? { userId, productId: productId! }
      : { sessionId, productId: productId! }

    await withRetry(() =>
      prisma.savedCartItem.deleteMany({
        where,
      })
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing saved item:', error)
    return NextResponse.json(
      { error: 'Failed to remove saved item' },
      { status: 500 }
    )
  }
}

