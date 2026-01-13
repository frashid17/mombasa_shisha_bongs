'use client'

import { useRouter } from 'next/navigation'
import PullToRefresh from '@/components/PullToRefresh'

interface AdminPageWrapperProps {
  children: React.ReactNode
}

export default function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  const router = useRouter()

  const handleRefresh = async () => {
    // Wait a bit for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500))
    router.refresh()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {children}
    </PullToRefresh>
  )
}
