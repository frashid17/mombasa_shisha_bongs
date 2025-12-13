import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/notifications/email'
import { NotificationType } from '@/generated/prisma'
import { createSecureResponse } from '@/utils/security-headers'
import { z } from 'zod'
import { EMAIL_TEMPLATES, EmailTopic, ProductData } from '@/lib/email-templates'

const bulkEmailSchema = z.object({
  topic: z.enum(['NEW_ITEMS', 'DISCOUNTS', 'TRENDING', 'OFFERS']),
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.coerce.number(), // Coerce string to number
      compareAtPrice: z.coerce.number().nullable().optional(),
      image: z.string().optional(),
      slug: z.string().optional(),
      discountPercent: z.coerce.number().optional(),
    })
  ).min(1, 'At least one product is required'),
  discountInfo: z.string().max(500).optional(),
  offerInfo: z.string().max(500).optional(),
  customerIds: z.array(z.string()).optional(),
  includeGuest: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createSecureResponse(
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    // Check if user is admin via Clerk metadata
    const user = await currentUser()
    const role = (user?.publicMetadata as { role?: string })?.role

    if (role !== 'admin') {
      return createSecureResponse(
        { success: false, error: 'Forbidden - Admin access required' },
        403
      )
    }

    const body = await req.json()
    const validated = bulkEmailSchema.parse(body)

    // Get customer emails with spending data
    let customerEmails: string[] = []

    if (validated.customerIds && validated.customerIds.length > 0) {
      // Get specific customers
      const orders = await prisma.order.findMany({
        where: {
          userId: { in: validated.customerIds },
        },
        select: {
          userEmail: true,
          userId: true,
        },
        distinct: ['userEmail'],
      })
      customerEmails = orders.map((o) => o.userEmail)
    } else {
      // Get all orders with customer info
      const allOrders = await prisma.order.findMany({
        select: {
          userEmail: true,
          userId: true,
          total: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      // Filter out guest customers if needed
      const filteredOrders = validated.includeGuest
        ? allOrders
        : allOrders.filter((o) => o.userId !== 'guest')

      // Group by userId to calculate total spent per customer
      const customerMap = new Map<
        string,
        { email: string; userId: string; totalSpent: number }
      >()

      filteredOrders.forEach((order) => {
        const existing = customerMap.get(order.userId)
        if (existing) {
          existing.totalSpent += Number(order.total)
        } else {
          customerMap.set(order.userId, {
            email: order.userEmail,
            userId: order.userId,
            totalSpent: Number(order.total),
          })
        }
      })

      // Get customers who spent more than 10,000 KES
      const highValueCustomers = Array.from(customerMap.values())
        .filter((customer) => customer.totalSpent >= 10000)
        .map((c) => c.email)

      // Get top 10 customers by total spent
      const topCustomers = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10)
        .map((c) => c.email)

      // Combine both: top 10 customers OR customers who spent > 10,000
      customerEmails = [...new Set([...topCustomers, ...highValueCustomers])]
    }

    // Remove duplicates
    customerEmails = [...new Set(customerEmails)]

    if (customerEmails.length === 0) {
      return createSecureResponse(
        { success: false, error: 'No customers found to send emails to' },
        400
      )
    }

    // Get template for selected topic
    const template = EMAIL_TEMPLATES[validated.topic]
    if (!template) {
      return createSecureResponse(
        { success: false, error: 'Invalid email topic' },
        400
      )
    }

    // Prepare product data
    const productData: ProductData[] = validated.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice || null,
      image: p.image,
      slug: p.slug,
      discountPercent: p.discountPercent,
    }))

    // Calculate discounted prices for discount topic
    if (validated.topic === 'DISCOUNTS') {
      productData.forEach((product) => {
        if (product.discountPercent && product.discountPercent > 0) {
          const originalPrice = product.compareAtPrice || product.price
          product.price = Math.round(Number(originalPrice) * (1 - product.discountPercent / 100))
          product.compareAtPrice = originalPrice
        }
      })
    }

    // Generate email content from template
    const subject = template.subject
    const htmlBody = template.getHtmlBody(
      productData,
      validated.topic === 'DISCOUNTS' ? validated.discountInfo : validated.offerInfo
    )
    const textBody = template.getTextBody(
      productData,
      validated.topic === 'DISCOUNTS' ? validated.discountInfo : validated.offerInfo
    )

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 10
    const results = {
      total: customerEmails.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (let i = 0; i < customerEmails.length; i += batchSize) {
      const batch = customerEmails.slice(i, i + batchSize)
      
      await Promise.allSettled(
        batch.map(async (email) => {
          try {
            const result = await sendEmail({
              to: email,
              subject,
              html: htmlBody,
              text: textBody,
              type: NotificationType.ADMIN_ALERT,
              metadata: {
                bulkEmail: true,
                topic: validated.topic,
                customerCount: customerEmails.length,
                productCount: validated.products.length,
              },
            })

            if (result.success) {
              results.sent++
            } else {
              results.failed++
              results.errors.push(`${email}: ${result.error || 'Unknown error'}`)
            }
          } catch (error: any) {
            results.failed++
            results.errors.push(`${email}: ${error.message || 'Unknown error'}`)
          }
        })
      )

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < customerEmails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return createSecureResponse(
      {
        success: true,
        results,
        message: `Emails sent to ${results.sent} out of ${results.total} customers`,
      },
      200
    )
  } catch (error: any) {
    console.error('Bulk email error:', error)
    return createSecureResponse(
      { success: false, error: error.message || 'Failed to send bulk emails' },
      400
    )
  }
}

