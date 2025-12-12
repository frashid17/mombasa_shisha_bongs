import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { addSecurityHeaders } from '@/utils/security-headers'

export default clerkMiddleware((auth, req) => {
  // Get response
  const response = NextResponse.next()

  // Add security headers to all responses
  addSecurityHeaders(response)

  // Add user ID to headers for rate limiting (if authenticated)
  const { userId } = auth()
  if (userId) {
    response.headers.set('x-user-id', userId)
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

