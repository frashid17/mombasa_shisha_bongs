import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const rejectPaymentSchema = z.object({
  reason: z.string().min(5).max(500).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    const body = await req.json()
    const validated = rejectPaymentSchema.parse(body)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const user = await currentUser()
    const role = (user?.publicMetadata as { role?: string })?.role

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot reject an already approved payment' },
        { status: 400 }
      )
    }

    // Update payment status
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'FAILED',
        errorMessage: validated.reason || 'Payment rejected by admin',
      },
    })

    // Update order payment status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'FAILED',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment rejected successfully',
    })
  } catch (error: any) {
    console.error('Error rejecting payment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to reject payment' },
      { status: 500 }
    )
  }
}

