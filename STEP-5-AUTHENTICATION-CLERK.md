# 🔐 STEP 5 — AUTHENTICATION USING CLERK

## 📋 Table of Contents
1. [Clerk Overview](#clerk-overview)
2. [Setup Instructions](#setup-instructions)
3. [Middleware Configuration](#middleware-configuration)
4. [Provider Setup](#provider-setup)
5. [Admin Role Implementation](#admin-role-implementation)
6. [Protected Routes](#protected-routes)
7. [Authentication Helpers](#authentication-helpers)
8. [Sign-In/Sign-Up Pages](#sign-insign-up-pages)

---

## 🌐 Clerk Overview

### What is Clerk?

Clerk is a complete authentication and user management solution that provides:
- 🔐 **Authentication**: Email, phone, social logins
- 👤 **User Management**: Built-in user dashboard
- 🎭 **Role-Based Access**: Custom roles and permissions
- 🔒 **Security**: MFA, session management, security headers
- 📱 **Pre-built UI**: Beautiful, customizable components

### Why Clerk for This Project?

- ✅ **No Backend Code**: Clerk handles all auth logic
- ✅ **Production-Ready**: Battle-tested security
- ✅ **Next.js Optimized**: First-class Next.js support
- ✅ **Role Management**: Easy admin role implementation
- ✅ **Developer Experience**: Simple API, great docs
- ✅ **Free Tier**: Generous free tier for development

---

## 🚀 Setup Instructions

### Step 1: Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Name it "Mombasa Shisha Bongs"

### Step 2: Get API Keys

From your Clerk Dashboard:

1. Go to **API Keys** section
2. Copy your keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 3: Update Environment Variables

Update `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Step 4: Configure Clerk Dashboard

In your Clerk Dashboard:

1. **Authentication**:
   - Enable Email/Password
   - Enable Google OAuth (optional)
   - Enable Phone Number (optional)

2. **Sessions**:
   - Session lifetime: 7 days (default)
   - Require MFA: Optional

3. **User & Authentication**:
   - Username: Optional
   - Phone number: Required (for order notifications)
   - Email: Required

---

## 🛡️ Middleware Configuration

### File: `src/middleware.ts`

```typescript
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/products',
    '/products/(.*)',
    '/categories',
    '/categories/(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/products(.*)',
    '/api/categories(.*)',
    '/api/mpesa/callback',
  ],

  // Routes that require authentication
  // All other routes not in publicRoutes

  // Admin routes (will check role in API)
  // /admin(.*) routes
  // /api/admin(.*) routes

  // Ignore these routes completely
  ignoredRoutes: [
    '/api/webhook(.*)',
    '/_next(.*)',
    '/favicon.ico',
    '/images(.*)',
  ],

  // Don't redirect to sign-in for API routes, return 401 instead
  apiRoutes: ['/api(.*)'],

  // After sign-in redirect
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
        const role = (sessionClaims?.metadata as { role?: string })?.role

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
```

### How Middleware Works

```
User Request
    │
    ▼
Is Public Route? ──Yes──> Allow Access
    │
    No
    ▼
Is Authenticated? ──No──> Redirect to /sign-in
    │
    Yes
    ▼
Is Admin Route? ──No──> Allow Access
    │
    Yes
    ▼
Has Admin Role? ──No──> Redirect to /
    │
    Yes
    ▼
Allow Access
```

---

## 🎨 Provider Setup

### File: `src/app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mombasa Shisha Bongs',
  description: 'Premium shisha, vapes, and smoking accessories in Mombasa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### With React Query Provider

```typescript
'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ClerkProvider>
  )
}
```

---

## 👑 Admin Role Implementation

### Setting Up Admin Role

#### Method 1: Via Clerk Dashboard

1. Go to **Users** in Clerk Dashboard
2. Click on a user
3. Scroll to **Public Metadata**
4. Add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save

#### Method 2: Via Clerk API

```typescript
import { clerkClient } from '@clerk/nextjs'

async function makeUserAdmin(userId: string) {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: 'admin',
    },
  })
}
```

### Checking Admin Role in API Routes

#### File: `src/utils/auth.ts`

```typescript
import { auth, currentUser } from '@clerk/nextjs'
import { unauthorizedError, forbiddenError } from './api-response'

/**
 * Get current user from Clerk
 */
export async function getCurrentUser() {
  const user = await currentUser()
  
  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    phone: user.phoneNumbers[0]?.phoneNumber || '',
    imageUrl: user.imageUrl,
    role: (user.publicMetadata as { role?: string })?.role || 'user',
  }
}

/**
 * Require authentication in API routes
 */
export async function requireAuth() {
  const { userId } = auth()

  if (!userId) {
    return unauthorizedError()
  }

  const user = await getCurrentUser()
  
  if (!user) {
    return unauthorizedError()
  }

  return user
}

/**
 * Require admin role in API routes
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (user instanceof Response) {
    return user // Return error response
  }

  if (user.role !== 'admin') {
    return forbiddenError('Admin access required')
  }

  return user
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Get user ID (returns null if not authenticated)
 */
export function getUserId(): string | null {
  const { userId } = auth()
  return userId
}
```

### Using in API Routes

```typescript
// app/api/admin/products/route.ts
import { requireAdmin } from '@/utils/auth'
import { successResponse } from '@/utils/api-response'

export async function GET() {
  const admin = await requireAdmin()

  // If admin is a Response, return it (it's an error)
  if (admin instanceof Response) {
    return admin
  }

  // Admin is authenticated, proceed
  const products = await prisma.product.findMany()

  return successResponse(products)
}
```

---

## 🔒 Protected Routes

### Client-Side Protection (Pages)

#### Protect Individual Pages

```typescript
// app/orders/page.tsx
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/orders')
  }

  return (
    <div>
      <h1>My Orders</h1>
      {/* Order list */}
    </div>
  )
}
```

#### Using Clerk Components

```typescript
'use client'

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'

export default function OrdersPage() {
  return (
    <>
      <SignedIn>
        <div>
          <h1>My Orders</h1>
          {/* Order list */}
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
```

### Admin Route Protection

```typescript
// app/admin/page.tsx
import { auth, currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/admin')
  }

  const user = await currentUser()
  const role = (user?.publicMetadata as { role?: string })?.role

  if (role !== 'admin') {
    redirect('/')
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  )
}
```

### Layout-Based Protection

```typescript
// app/(admin)/admin/layout.tsx
import { auth, currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/admin')
  }

  const user = await currentUser()
  const role = (user?.publicMetadata as { role?: string })?.role

  if (role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside>{/* Sidebar content */}</aside>

      {/* Admin Content */}
      <main>{children}</main>
    </div>
  )
}
```

---

## 🧰 Authentication Helpers

### File: `src/hooks/useUser.ts`

```typescript
'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser()

  return {
    user: user
      ? {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phone: user.phoneNumbers[0]?.phoneNumber || '',
          imageUrl: user.imageUrl,
          role: (user.publicMetadata as { role?: string })?.role || 'user',
        }
      : null,
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    isAdmin: (user?.publicMetadata as { role?: string })?.role === 'admin',
  }
}
```

### File: `src/components/auth/AdminOnly.tsx`

```typescript
'use client'

import { useUser } from '@/hooks/useUser'
import { ReactNode } from 'react'

interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin, isLoaded } = useUser()

  if (!isLoaded) {
    return null
  }

  if (!isAdmin) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

### File: `src/components/auth/ProtectedRoute.tsx`

```typescript
'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/sign-in',
}: ProtectedRouteProps) {
  const { isSignedIn, isAdmin, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push(redirectTo)
      } else if (requireAdmin && !isAdmin) {
        router.push('/')
      }
    }
  }, [isLoaded, isSignedIn, isAdmin, requireAdmin, redirectTo, router])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn || (requireAdmin && !isAdmin)) {
    return null
  }

  return <>{children}</>
}
```

---

## 📝 Sign-In/Sign-Up Pages

### File: `src/app/sign-in/[[...sign-in]]/page.tsx`

```typescript
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              card: 'shadow-xl',
            },
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  )
}
```

### File: `src/app/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Account
          </h1>
          <p className="mt-2 text-gray-600">
            Sign up to start shopping
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              card: 'shadow-xl',
            },
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  )
}
```

### Custom Sign-In Form (Alternative)

```typescript
'use client'

import { useSignIn } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isLoaded) return

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
      }
    } catch (err: any) {
      setError(err.errors[0]?.message || 'Sign in failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Sign In
      </button>
    </form>
  )
}
```

---

## 🎨 Clerk Components

### User Button (Profile Menu)

```typescript
import { UserButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header>
      <nav className="flex items-center justify-between">
        <div>Logo</div>

        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-10 h-10',
            },
          }}
          afterSignOutUrl="/"
        />
      </nav>
    </header>
  )
}
```

### Sign-In/Sign-Up Buttons

```typescript
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'

export function AuthButtons() {
  return (
    <div className="flex gap-4">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-4 py-2 text-blue-600">Sign In</button>
        </SignInButton>

        <SignUpButton mode="modal">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Sign Up
          </button>
        </SignUpButton>
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
}
```

---

## 📊 User Flow Diagrams

### Authentication Flow

```
New User
    │
    ▼
Visit Site
    │
    ▼
Click "Sign Up"
    │
    ▼
Enter Email + Password
    │
    ▼
Verify Email
    │
    ▼
Complete Profile (Phone)
    │
    ▼
Redirect to Homepage
    │
    ▼
Authenticated Session Created
```

### Admin Access Flow

```
Admin User
    │
    ▼
Sign In
    │
    ▼
Clerk Checks publicMetadata.role
    │
    ├──> role === 'admin' ──> Access Granted
    │
    └──> role !== 'admin' ──> Redirect to Homepage
```

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit API keys
2. **HTTPS Only**: Enforce HTTPS in production
3. **Role Verification**: Always verify roles server-side
4. **Session Expiry**: Configure appropriate session lifetimes
5. **MFA**: Enable for admin accounts
6. **Audit Logs**: Log admin actions
7. **Rate Limiting**: Protect authentication endpoints
8. **CORS**: Configure properly for API routes

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Clerk account created
- [ ] API keys added to `.env.local`
- [ ] Middleware configured
- [ ] ClerkProvider added to layout
- [ ] Sign-in page accessible at `/sign-in`
- [ ] Sign-up page accessible at `/sign-up`
- [ ] User can sign up and sign in
- [ ] Session persists after refresh
- [ ] Admin role can be assigned
- [ ] Admin routes are protected
- [ ] API routes check authentication
- [ ] User metadata accessible

---

## 🚀 Next Steps

**Type "NEXT" to proceed to:**

**STEP 6 — ADMIN DASHBOARD IMPLEMENTATION**

This will include:
- 📊 Dashboard with statistics
- 📦 Product management (CRUD)
- 📋 Order management
- 📂 Category management
- ⚙️ Settings page
- 🎨 Admin UI components

---

**Authentication**: ✅ **CONFIGURED**  
**Clerk Setup**: ✅ **READY**  
**Admin Roles**: ✅ **IMPLEMENTED**  
**Protected Routes**: ✅ **SECURED**

