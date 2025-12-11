'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Bell, Store } from 'lucide-react'

export default function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Store className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Mombasa Shisha Bongs
              </h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* View Store */}
          <Link
            href="/"
            target="_blank"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            View Store →
          </Link>

          {/* Notifications */}
          <button
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}

