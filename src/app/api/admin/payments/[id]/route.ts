import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

/**
 * DELETE endpoint to remove a payment
 * Note: This will not delete the associated order, only the payment record
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin role
    const user = await currentUser()
    const role = (user?.publicMetadata as { role?: string })?.role

    if (role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // If payment is PAID, we should warn or prevent deletion
    // But for now, we'll allow deletion with a note
    if (payment.status === 'PAID') {
      // Update order payment status back to PENDING if payment was PAID
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'PENDING',
          // Don't change order status, just payment status
        },
      })
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete payment',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

