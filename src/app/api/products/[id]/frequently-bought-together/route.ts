import { NextRequest, NextResponse } from 'next/server'
import { getFrequentlyBoughtTogether } from '@/lib/recommendations'
import { serializeProducts } from '@/lib/prisma-serialize'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recommendations = await getFrequentlyBoughtTogether(id, 4)
    const serialized = serializeProducts(recommendations)
    return NextResponse.json(serialized)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

