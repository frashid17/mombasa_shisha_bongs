'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  redirectTo?: string
  loadingComponent?: ReactNode
}

/**
 * Wrapper component for protecting client-side routes
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/sign-in',
  loadingComponent = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const { isSignedIn, isAdmin, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      // Redirect if not signed in
      if (!isSignedIn) {
        const currentUrl = window.location.pathname
        router.push(`${redirectTo}?redirect_url=${encodeURIComponent(currentUrl)}`)
        return
      }

      // Redirect if admin access required but user is not admin
      if (requireAdmin && !isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoaded, isSignedIn, isAdmin, requireAdmin, redirectTo, router])

  // Show loading state
  if (!isLoaded) {
    return <>{loadingComponent}</>
  }

  // Don't render if requirements not met
  if (!isSignedIn || (requireAdmin && !isAdmin)) {
    return null
  }

  // Render protected content
  return <>{children}</>
}

