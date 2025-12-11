import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/products(.*)',
    '/categories(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/products(.*)',
    '/api/categories(.*)',
    '/api/mpesa/callback',
  ],

  // Ignore these routes completely
  ignoredRoutes: [
    '/api/webhook(.*)',
    '/_next(.*)',
    '/favicon.ico',
    '/images(.*)',
    '/((?!api|trpc))(_next|.+\\..+)(.*)',
  ],

  // After authentication callback
  afterAuth(auth, req) {
    // Handle unauthenticated users trying to access protected routes
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
    }

    // Handle authenticated users accessing admin routes
    if (auth.userId) {
      const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
      const isAdminApiRoute = req.nextUrl.pathname.startsWith('/api/admin')

      if (isAdminRoute || isAdminApiRoute) {
        const { sessionClaims } = auth
        const metadata = sessionClaims?.publicMetadata as { role?: string } | undefined
        const role = metadata?.role

        // If not admin, redirect to homepage
        if (role !== 'admin') {
          const homeUrl = new URL('/', req.url)
          return Response.redirect(homeUrl)
        }
      }
    }

    // Allow the request to proceed
    return
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}

