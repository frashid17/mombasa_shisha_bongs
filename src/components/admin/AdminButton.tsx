'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function AdminButton() {
  return (
    <Link
      href="/admin"
      className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
      title="Go to Admin Dashboard"
    >
      <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      <span className="font-semibold text-sm">Admin</span>
    </Link>
  )
}

