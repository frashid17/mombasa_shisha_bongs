'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Settings,
  Users,
  BarChart3,
  Bell,
  X,
  Zap,
  Calendar,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Bundles', href: '/admin/bundles', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Scheduled Deliveries', href: '/admin/orders/scheduled', icon: Calendar },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Flash Sales', href: '/admin/flash-sales', icon: Zap },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [pathname])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-14 sm:top-16 z-40
          w-64 bg-white border-r border-gray-200
          h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
        `}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <nav className="p-2 sm:p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors
                  ${
                    isActive
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

