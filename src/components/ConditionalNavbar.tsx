'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return null
  }

  return <Navbar />
}

