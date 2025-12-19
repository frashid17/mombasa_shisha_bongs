import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { addSecurityHeaders } from '@/utils/security-headers'

export default clerkMiddleware(async (auth, req) => {
  // Always return a response, even if something fails
  const response = NextResponse.next()
  
  try {
    // Add pathname to headers for conditional rendering in layout
    const pathname = req.nextUrl.pathname || '/'
    response.headers.set('x-pathname', pathname)

    // Only add security headers in production
    // In development, CSP might be too restrictive for Clerk CAPTCHA
    try {
      if (process.env.NODE_ENV === 'production') {
        addSecurityHeaders(response)
      } else {
        // In development, only add non-CSP headers
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      }
    } catch (headerError) {
      // Security headers are non-critical - continue
      console.error('Security headers error:', headerError)
    }

    // Add user ID to headers for rate limiting (if authenticated)
    // This is optional and should never fail the request
    try {
      const authResult = await auth()
      if (authResult?.userId) {
        response.headers.set('x-user-id', authResult.userId)
      }
    } catch (authError) {
      // Auth errors are non-fatal - continue without user ID
      // This is expected if Clerk keys are missing or invalid
    }
  } catch (error) {
    // If anything fails, still return a response
    // Log error but don't break the request
    console.error('Proxy error (non-fatal):', error)
    // Ensure pathname is set even on error
    const pathname = req.nextUrl.pathname || '/'
    response.headers.set('x-pathname', pathname)
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

