import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [colors, specs] = await Promise.all([
      prisma.productColor.count({
        where: {
          productId: id,
          isActive: true,
        },
      }),
      prisma.productSpecification.count({
        where: {
          productId: id,
          isActive: true,
        },
      }),
    ])

    return NextResponse.json({
      hasColors: colors > 0,
      hasSpecs: specs > 0,
    })
  } catch (error: any) {
    console.error('Error checking product options:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check product options' },
      { status: 500 }
    )
  }
}

