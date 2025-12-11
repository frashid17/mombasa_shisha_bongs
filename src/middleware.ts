import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/orders(.*)',
  '/checkout(.*)',
  '/api/orders(.*)',
  '/api/reviews(.*)',
  '/api/mpesa/initiate(.*)',
])

// Define admin routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth()

  // Check if route is admin route
  if (isAdminRoute(req)) {
    // Redirect to sign-in if not authenticated
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user has admin role
    const metadata = sessionClaims?.publicMetadata as { role?: string } | undefined
    const role = metadata?.role

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Check if route requires authentication
  if (isProtectedRoute(req)) {
    // Redirect to sign-in if not authenticated
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

