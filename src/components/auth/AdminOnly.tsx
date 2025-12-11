'use client'

import { useUser } from '@/hooks/useUser'
import { ReactNode } from 'react'

interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

/**
 * Component that only renders for admin users
 * Shows fallback for non-admin users
 */
export function AdminOnly({
  children,
  fallback = null,
  loadingFallback = null,
}: AdminOnlyProps) {
  const { isAdmin, isLoaded } = useUser()

  // Show loading state while checking auth
  if (!isLoaded) {
    return <>{loadingFallback}</>
  }

  // Show fallback if not admin
  if (!isAdmin) {
    return <>{fallback}</>
  }

  // Render children for admin users
  return <>{children}</>
}

