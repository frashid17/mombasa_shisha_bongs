import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const { productId, email } = await req.json()

    if (!productId || !email) {
      return NextResponse.json({ error: 'Product ID and email are required' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create or update stock notification
    await prisma.stockNotification.upsert({
      where: {
        productId_email: {
          productId,
          email,
        },
      },
      create: {
        productId,
        userId: userId || null,
        email,
        notified: false,
      },
      update: {
        notified: false,
        notifiedAt: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Stock notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

