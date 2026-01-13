'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import PullToRefresh from '@/components/PullToRefresh'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    // Wait a bit for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500))
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content - Scrollable with left margin for sidebar */}
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="lg:ml-64 min-h-screen" style={{ paddingTop: '4rem' }}>
          <div className="max-w-7xl mx-auto w-full p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
            {children}
          </div>
        </main>
      </PullToRefresh>
    </div>
  )
}

