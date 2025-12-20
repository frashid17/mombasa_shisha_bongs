import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const colors = await prisma.productColor.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(colors)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { name, value } = body

    if (!name || !value) {
      return NextResponse.json({ error: 'Name and value are required' }, { status: 400 })
    }

    const color = await prisma.productColor.create({
      data: {
        productId: id,
        name,
        value,
      },
    })

    return NextResponse.json(color, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

