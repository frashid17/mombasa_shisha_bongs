import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        categories: categoryCount,
        products: productCount,
        orders: orderCount,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    )
  }
}

