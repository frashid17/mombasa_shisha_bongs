import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { createSecureResponse } from '@/utils/security-headers'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = subscribeSchema.parse(body)

    // Check if email already exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      return createSecureResponse(
        { success: true, message: 'You are already subscribed!' },
        200
      )
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: { email },
    })

    return createSecureResponse(
      { success: true, message: 'Successfully subscribed to newsletter!' },
      201
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createSecureResponse(
        { success: false, error: error.issues[0].message },
        400
      )
    }

    console.error('Newsletter subscription error:', error)
    return createSecureResponse(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      500
    )
  }
}

