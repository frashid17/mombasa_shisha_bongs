'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { Bell, Store, Mail, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock, Menu, Trash2, X as CloseIcon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)
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

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Delete this notification?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id))
        setUnreadCount(prev => Math.max(0, prev - 1))
        toast.success('Notification deleted')
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      toast.error('Failed to delete notification')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteAllNotifications = async () => {
    if (!confirm('Delete all notifications? This action cannot be undone.')) return

    setDeletingAll(true)
    try {
      const res = await fetch('/api/admin/notifications/delete-all', {
        method: 'DELETE',
      })

      if (res.ok) {
        const data = await res.json()
        setNotifications([])
        setUnreadCount(0)
        toast.success(`Deleted ${data.count} notification(s)`)
      } else {
        toast.error('Failed to delete notifications')
      }
    } catch (error) {
      toast.error('Failed to delete notifications')
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
              <>
                {/* Mobile Overlay */}
                <div 
                  className="fixed inset-0 bg-black/20 z-[60] sm:hidden"
                  onClick={() => setIsOpen(false)}
                />
                
                {/* Dropdown */}
                <div className="fixed inset-x-0 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:mt-2 w-full sm:w-[420px] bg-white sm:rounded-lg shadow-2xl border-t sm:border border-gray-200 max-h-[calc(100vh-3.5rem)] sm:max-h-[600px] overflow-hidden flex flex-col z-[70]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="sm:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Close"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/admin/notifications"
                      onClick={() => setIsOpen(false)}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      View All
                    </Link>
                    {notifications.length > 0 && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={handleDeleteAllNotifications}
                          disabled={deletingAll}
                          className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {deletingAll ? 'Deleting...' : 'Delete All'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => {
                        const ChannelIcon = channelIcons[notification.channel] || AlertCircle
                        const isUnread = notification.status === 'PENDING' || notification.status === 'FAILED'

                        return (
                          <div
                            key={notification.id}
                            className={`relative group ${
                              isUnread ? 'bg-red-50/30' : 'bg-white'
                            }`}
                          >
                            <Link
                              href={`/admin/notifications/${notification.id}`}
                              onClick={() => setIsOpen(false)}
                              className="block p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                  className={`flex-shrink-0 p-2 rounded-lg ${
                                    notification.status === 'SENT' || notification.status === 'DELIVERED'
                                      ? 'bg-green-100 text-green-600'
                                      : notification.status === 'FAILED'
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-yellow-100 text-yellow-600'
                                  }`}
                                >
                                  <ChannelIcon className="w-4 h-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pr-8">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                      {getNotificationTitle(notification)}
                                    </p>
                                    {isUnread && (
                                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 truncate mb-1">
                                    {notification.recipientEmail}
                                  </p>
                                  {notification.orderNumber && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      Order: #{notification.orderNumber}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                        statusColors[notification.status] || statusColors.PENDING
                                      }`}
                                    >
                                      {notification.status}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                      {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              disabled={deleting === notification.id}
                              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              aria-label="Delete notification"
                              title="Delete"
                            >
                              {deleting === notification.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              </>
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


