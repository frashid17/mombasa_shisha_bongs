'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

/**
 * Hide storefront navbar on admin routes.
 * Always render a stable Navbar instance on storefront routes —
 * do not remount after hydration (that caused intermittent missing nav).
 */
export default function ConditionalNavbar() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin') ?? false

  if (isAdminRoute) {
    return null
  }

  return <Navbar />
}
