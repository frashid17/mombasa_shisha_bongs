import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

/**
 * API Route to find and remove duplicate payments based on reference number
 * Keeps the oldest payment (by createdAt) and deletes duplicates
 */
export async function POST(req: Request) {
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

    // Find all M-Pesa payments with reference numbers
    const payments = await prisma.payment.findMany({
      where: {
        method: 'MPESA',
        mpesaReceiptNumber: { not: null },
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    })

    // Group payments by reference number
    const paymentsByReference = new Map<string, typeof payments>()

    for (const payment of payments) {
      if (!payment.mpesaReceiptNumber) continue

      const ref = payment.mpesaReceiptNumber
      if (!paymentsByReference.has(ref)) {
        paymentsByReference.set(ref, [])
      }
      paymentsByReference.get(ref)!.push(payment)
    }

    // Find duplicates (reference numbers with more than one payment)
    const duplicates: Array<{
      referenceNumber: string
      count: number
      keepId: string
      deleteIds: string[]
    }> = []

    for (const [ref, refPayments] of paymentsByReference.entries()) {
      if (refPayments.length > 1) {
        // Keep the oldest payment (first in array since sorted by createdAt asc)
        const keepPayment = refPayments[0]
        const deletePayments = refPayments.slice(1)

        duplicates.push({
          referenceNumber: ref,
          count: refPayments.length,
          keepId: keepPayment.id,
          deleteIds: deletePayments.map(p => p.id),
        })
      }
    }

    if (duplicates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duplicate payments found',
        duplicatesFound: 0,
        duplicatesRemoved: 0,
      })
    }

    // Delete duplicate payments
    let deletedCount = 0
    const errors: string[] = []

    for (const duplicate of duplicates) {
      for (const deleteId of duplicate.deleteIds) {
        try {
          await prisma.payment.delete({
            where: { id: deleteId },
          })
          deletedCount++
        } catch (error: any) {
          errors.push(`Failed to delete payment ${deleteId}: ${error.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${duplicates.length} duplicate reference number(s). Removed ${deletedCount} duplicate payment(s).`,
      duplicatesFound: duplicates.length,
      duplicatesRemoved: deletedCount,
      duplicates: duplicates.map(d => ({
        referenceNumber: d.referenceNumber,
        count: d.count,
        kept: d.keepId,
        removed: d.deleteIds,
      })),
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error cleaning up duplicate payments:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clean up duplicate payments',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

