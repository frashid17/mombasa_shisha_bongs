import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; colorId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { colorId } = await params
    const body = await req.json()
    const { name, value, isActive } = body

    const color = await prisma.productColor.update({
      where: { id: colorId },
      data: {
        name,
        value,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(color)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; colorId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { colorId } = await params

    await prisma.productColor.delete({
      where: { id: colorId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

