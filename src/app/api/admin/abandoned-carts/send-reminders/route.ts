import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createSecureResponse } from '@/utils/security-headers'
import { sendAbandonedCartReminder } from '@/lib/notifications/abandoned-cart'

// POST - Send abandoned cart reminders (cron job endpoint)
export async function POST(req: Request) {
  try {
    // Check for cron secret (for security)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return createSecureResponse(
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    // Find abandoned carts that need reminders
    const abandonedCarts = await prisma.abandonedCart.findMany({
      where: {
        converted: false,
        OR: [
          // First reminder: 1 hour after abandonment, no reminders sent yet
          {
            createdAt: { lte: oneHourAgo },
            reminderSent: 0,
            email: { not: null },
          },
          // Second reminder: 24 hours after abandonment, 1 reminder sent
          {
            createdAt: { lte: oneDayAgo },
            reminderSent: 1,
            lastReminderAt: { lte: oneHourAgo },
            email: { not: null },
          },
          // Third reminder: 3 days after abandonment, 2 reminders sent
          {
            createdAt: { lte: threeDaysAgo },
            reminderSent: 2,
            lastReminderAt: { lte: oneDayAgo },
            email: { not: null },
          },
        ],
      },
    })

    let sent = 0
    let failed = 0

    for (const cart of abandonedCarts) {
      try {
        if (!cart.email) continue

        const cartItems = JSON.parse(cart.cartData)
        const total = cartItems.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        )

        await sendAbandonedCartReminder({
          email: cart.email,
          cartItems,
          total,
          reminderNumber: cart.reminderSent + 1,
        })

        // Update reminder count
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: {
            reminderSent: cart.reminderSent + 1,
            lastReminderAt: new Date(),
          },
        })

        sent++
      } catch (error) {
        console.error(`Failed to send reminder for cart ${cart.id}:`, error)
        failed++
      }
    }

    return createSecureResponse({
      success: true,
      message: `Reminders sent: ${sent}, Failed: ${failed}`,
      data: {
        sent,
        failed,
        total: abandonedCarts.length,
      },
    })
  } catch (error: any) {
    console.error('Error sending abandoned cart reminders:', error)
    return createSecureResponse(
      {
        success: false,
        error: error.message || 'Failed to send reminders',
      },
      500
    )
  }
}

