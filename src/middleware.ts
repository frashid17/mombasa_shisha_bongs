import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { addSecurityHeaders } from '@/utils/security-headers'

export default clerkMiddleware(async (auth, req) => {
  try {
    // Get response
    const response = NextResponse.next()

    // Add pathname to headers for conditional rendering in layout
    const pathname = req.nextUrl.pathname
    response.headers.set('x-pathname', pathname)

    // Only add security headers in production
    // In development, CSP might be too restrictive for Clerk CAPTCHA
    if (process.env.NODE_ENV === 'production') {
      addSecurityHeaders(response)
    } else {
      // In development, only add non-CSP headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    // Add user ID to headers for rate limiting (if authenticated)
    try {
      const authResult = await auth()
      if (authResult?.userId) {
        response.headers.set('x-user-id', authResult.userId)
      }
    } catch (authError) {
      // Auth errors are non-fatal - continue without user ID
      console.error('Auth error in middleware:', authError)
    }

    return response
  } catch (error) {
    // If middleware fails, return a basic response
    console.error('Middleware error:', error)
    const response = NextResponse.next()
    response.headers.set('x-pathname', req.nextUrl.pathname)
    return response
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

