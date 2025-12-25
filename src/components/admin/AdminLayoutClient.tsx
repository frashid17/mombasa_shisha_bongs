'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content - Scrollable with left margin for sidebar */}
      <main className="lg:ml-64 min-h-screen" style={{ paddingTop: '5rem' }}>
        <div className="max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

