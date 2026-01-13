'use client'

import { useRouter } from 'next/navigation'
import PullToRefresh from '@/components/PullToRefresh'

interface ClientPageWrapperProps {
  children: React.ReactNode
}

export default function ClientPageWrapper({ children }: ClientPageWrapperProps) {
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
