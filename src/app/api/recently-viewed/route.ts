import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getRecentlyViewed } from '@/lib/recently-viewed'
import { serializeProducts } from '@/lib/prisma-serialize'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    const sessionId = req.nextUrl.searchParams.get('sessionId') || undefined

    const products = await getRecentlyViewed(userId || undefined, sessionId, 12)
    const serialized = serializeProducts(products)

    return NextResponse.json(serialized)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

