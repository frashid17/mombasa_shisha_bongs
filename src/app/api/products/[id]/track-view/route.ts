import { NextRequest, NextResponse } from 'next/server'
import { trackProductView } from '@/lib/recently-viewed'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { sessionId } = await req.json()

    await trackProductView(id, sessionId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

