'use client'

import { useRouter, usePathname } from 'next/navigation'
import PullToRefresh from '@/components/PullToRefresh'

interface MainLayoutClientProps {
  children: React.ReactNode
}

export default function MainLayoutClient({ children }: MainLayoutClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Don't add pull-to-refresh on admin routes (they have their own)
  const isAdminRoute = pathname?.startsWith('/admin')

  const handleRefresh = async () => {
    // Wait a bit for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500))
    router.refresh()
  }

  // Skip pull-to-refresh for admin routes
  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {children}
    </PullToRefresh>
  )
}
