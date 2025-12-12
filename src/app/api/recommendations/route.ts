import { NextRequest, NextResponse } from 'next/server'
import { getCartRecommendations } from '@/lib/recommendations'

export async function POST(req: NextRequest) {
  try {
    const { cartItemIds } = await req.json()
    const recommendations = await getCartRecommendations(cartItemIds || [])
    return NextResponse.json(recommendations)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

