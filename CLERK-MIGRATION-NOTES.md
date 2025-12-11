# 🔄 Clerk Migration Notes (v5+ API)

## Changes Made for Clerk v5+ Compatibility

### What Changed?

Clerk updated their API in v5+. The old `authMiddleware` has been replaced with `clerkMiddleware` and route matchers.

### Migration Updates

#### 1. Middleware (`src/middleware.ts`)

**Before (Old API):**
```typescript
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/'],
  afterAuth(auth, req) { ... }
})
```

**After (New API):**
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/orders(.*)'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth()
  // Custom logic here
})
```

#### 2. Auth Utilities (`src/utils/auth.ts`)

**Before:**
```typescript
import { auth, currentUser } from '@clerk/nextjs'
```

**After:**
```typescript
import { auth, currentUser } from '@clerk/nextjs/server'
```

### Key Differences

1. **Route Matching**: Use `createRouteMatcher()` instead of arrays
2. **Auth Function**: Call `auth()` as a function, not use as object
3. **Import Path**: Use `@clerk/nextjs/server` for server-side functions
4. **Matcher Config**: Updated regex pattern for better Next.js 15+ compatibility

### Updated Route Protection

```typescript
// Protected routes (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/orders(.*)',
  '/checkout(.*)',
  '/api/orders(.*)',
  '/api/reviews(.*)',
  '/api/mpesa/initiate(.*)',
])

// Admin routes (require admin role)
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])
```

### Admin Role Check

```typescript
export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth()
  
  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    
    const metadata = sessionClaims?.publicMetadata as { role?: string }
    if (metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
})
```

### Testing Checklist

After migration:

- [ ] Sign-in still works at `/sign-in`
- [ ] Sign-up still works at `/sign-up`
- [ ] Public routes are accessible without auth
- [ ] Protected routes redirect to sign-in
- [ ] Admin routes check for admin role
- [ ] API routes return 401 for unauthorized
- [ ] Session persists after refresh

### Resources

- [Clerk v5 Migration Guide](https://clerk.com/docs/upgrade-guides/core-2/nextjs)
- [clerkMiddleware Documentation](https://clerk.com/docs/references/nextjs/clerk-middleware)
- [Authentication Helpers](https://clerk.com/docs/references/nextjs/auth)

