import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { addSecurityHeaders } from '@/utils/security-headers'

export default clerkMiddleware(async (auth, req) => {
  // Get response
  const response = NextResponse.next()

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
  const authResult = await auth()
  if (authResult.userId) {
    response.headers.set('x-user-id', authResult.userId)
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

