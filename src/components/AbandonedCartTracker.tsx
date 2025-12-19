'use client'

import { useAbandonedCartTracking } from '@/hooks/useAbandonedCartTracking'

/**
 * Client component wrapper for abandoned cart tracking
 * This needs to be a client component to use hooks
 */
export default function AbandonedCartTracker() {
  useAbandonedCartTracking()
  return null // This component doesn't render anything
}

