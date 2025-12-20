import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { updateCategorySchema } from '@/utils/validations'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })
    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(category)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const data = updateCategorySchema.parse(body)

    const category = await prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { products: true } } },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It has ${category._count.products} product(s). Please reassign or delete products first.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete category. It is still referenced by products or other categories.' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

