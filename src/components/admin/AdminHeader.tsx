'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { Bell, Store, Mail, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock, Menu } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'

interface AdminHeaderProps {
  onMenuClick: () => void
}

interface Notification {
  id: string
  type: string
  channel: string
  subject: string | null
  recipientEmail: string
  status: string
  createdAt: string
  sentAt: string | null
  orderNumber: string | null
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { isLoaded } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  useEffect(() => {
    // Only fetch on client side
    if (typeof window === 'undefined') return

    async function fetchNotifications() {
      try {
        const res = await fetch('/api/admin/notifications?limit=5', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!res.ok) {
          // If not OK, set empty state and stop loading
          setNotifications([])
          setUnreadCount(0)
          setLoading(false)
          return
        }

        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } catch (error) {
        // Silently handle errors - don't show notifications if fetch fails
        console.error('Error fetching notifications:', error)
        setNotifications([])
        setUnreadCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const channelIcons: Record<string, any> = {
    EMAIL: Mail,
    SMS: MessageSquare,
    WHATSAPP: MessageSquare,
    PUSH: AlertCircle,
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    SENT: 'bg-red-100 text-red-800',
    FAILED: 'bg-red-100 text-red-800',
    DELIVERED: 'bg-green-100 text-green-800',
  }

  const getNotificationTitle = (notification: Notification) => {
    if (notification.subject) return notification.subject
    return notification.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <header className="bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-14 sm:h-16 px-2 sm:px-4 lg:px-8">
        {/* Mobile Menu Button & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <Link href="/admin" className="flex items-center gap-1.5 sm:gap-2">
            <Store className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-600" />
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                Mombasa Shisha Bongs
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Admin Dashboard</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-xs sm:text-sm font-bold text-gray-900">MSB Admin</h1>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
          {/* View Store Button */}
          <Link
            href="/"
            // target="_blank"
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">View Store</span>
          </Link>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[600px] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <Link
                    href="/admin/notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    View All
                  </Link>
                </div>

                <div className="overflow-y-auto flex-1">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notification) => {
                        const ChannelIcon = channelIcons[notification.channel] || AlertCircle
                        const isUnread = notification.status === 'PENDING' || notification.status === 'FAILED'

                        return (
                          <Link
                            key={notification.id}
                            href={`/admin/notifications/${notification.id}`}
                            onClick={() => setIsOpen(false)}
                            className={`block p-4 hover:bg-gray-50 transition-colors ${
                              isUnread ? 'bg-red-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  notification.status === 'SENT' || notification.status === 'DELIVERED'
                                    ? 'bg-green-100 text-green-600'
                                    : notification.status === 'FAILED'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-yellow-100 text-yellow-600'
                                }`}
                              >
                                <ChannelIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {getNotificationTitle(notification)}
                                  </p>
                                  {isUnread && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mb-1">
                                  {notification.recipientEmail}
                                </p>
                                {notification.orderNumber && (
                                  <p className="text-xs text-gray-400 mb-1">
                                    Order: #{notification.orderNumber}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <span
                                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                      statusColors[notification.status] || statusColors.PENDING
                                    }`}
                                  >
                                    {notification.status}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu - Only render after Clerk is loaded */}
          {isLoaded && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 sm:w-10 sm:h-10',
                },
              }}
            />
          )}
        </div>
      </div>
    </header>
  )
}


