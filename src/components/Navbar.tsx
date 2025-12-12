'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, isSignedIn } = useUser()
  const itemCount = useCartStore((state) => state.getItemCount())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition">
            Mombasa Shisha
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="hover:text-blue-400 transition">
              Products
            </Link>
            <Link href="/categories" className="hover:text-blue-400 transition">
              Categories
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-2 hover:text-blue-400 transition"
              >
                <User className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="hidden md:flex items-center gap-2 hover:text-blue-400 transition"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}

            <Link
              href="/cart"
              className="relative flex items-center gap-2 hover:text-blue-400 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <Link
              href="/products"
              className="block py-2 hover:text-blue-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="block py-2 hover:text-blue-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            {isSignedIn ? (
              <Link
                href="/admin"
                className="block py-2 hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="block py-2 hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

