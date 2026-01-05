'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before checking pathname to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Always render navbar initially to prevent flash of missing content
  // Only hide if we're certain it's an admin route after mount
  if (!isMounted) {
    // Render navbar during SSR and initial client render to prevent layout shift
    return <Navbar />
  }

  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return null
  }

  return <Navbar />
}

