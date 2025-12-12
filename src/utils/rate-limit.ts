/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiting for API routes
 * For production, consider using Redis or a dedicated service
 */

import { NextResponse } from 'next/server'
import { RATE_LIMITS } from './constants'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (clears on server restart)
// For production, use Redis or similar
const rateLimitStore: RateLimitStore = {}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Object.keys(rateLimitStore).forEach((key) => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key]
      }
    })
  }, 5 * 60 * 1000)
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // For authenticated users, use user ID for better rate limiting
  // This will be set by the middleware
  const userId = request.headers.get('x-user-id')
  
  return userId ? `user:${userId}` : `ip:${ip}`
}

/**
 * Check rate limit for a request
 * @param limit - Maximum requests per window
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
export function checkRateLimit(
  request: Request,
  limit: number,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const clientId = getClientId(request)
  const now = Date.now()
  const key = `${clientId}:${limit}:${windowMs}`

  // Get or create rate limit entry
  let entry = rateLimitStore[key]

  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + windowMs,
    }
    rateLimitStore[key] = entry
  }

  // Increment count
  entry.count++

  const remaining = Math.max(0, limit - entry.count)
  const allowed = entry.count <= limit

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  limit: number,
  windowMs: number = 60000
) {
  return (handler: (req: Request) => Promise<Response>) => {
    return async (req: Request): Promise<Response> => {
      const { allowed, remaining, resetTime } = checkRateLimit(req, limit, windowMs)

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
              details: {
                retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
              },
            },
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTime.toString(),
              'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            },
          }
        )
      }

      // Add rate limit headers to response
      try {
        const response = await handler(req)
        response.headers.set('X-RateLimit-Limit', limit.toString())
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', resetTime.toString())

        return response
      } catch (error: any) {
        // Ensure errors are returned as JSON, not HTML
        console.error('Handler error in rate limit middleware:', error)
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'An unexpected error occurred',
          },
          {
            status: 500,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': resetTime.toString(),
            },
          }
        )
      }
    }
  }
}

/**
 * Get rate limit for a specific endpoint type
 */
export function getRateLimitForEndpoint(endpoint: string): number {
  // Public endpoints
  if (endpoint.includes('/api/products') || endpoint.includes('/api/categories')) {
    return RATE_LIMITS.PUBLIC_PRODUCTS
  }

  // Payment endpoints
  if (endpoint.includes('/api/mpesa/initiate')) {
    return RATE_LIMITS.MPESA_INITIATE
  }

  // Order endpoints
  if (endpoint.includes('/api/orders') && endpoint.includes('POST')) {
    return RATE_LIMITS.CREATE_ORDER
  }

  // Review endpoints
  if (endpoint.includes('/api/reviews') && endpoint.includes('POST')) {
    return RATE_LIMITS.CREATE_REVIEW
  }

  // Admin endpoints
  if (endpoint.includes('/api/admin')) {
    if (endpoint.includes('DELETE')) {
      return RATE_LIMITS.ADMIN_DELETE
    }
    return RATE_LIMITS.ADMIN_WRITE
  }

  // Default limit
  return 60 // 60 requests per minute
}

