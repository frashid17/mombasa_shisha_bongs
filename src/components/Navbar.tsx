'use client'

import Link from 'next/link'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { ShoppingCart, User, Menu, LogOut, Settings, Heart, MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Logo from './Logo'
import CurrencySelector from './CurrencySelector'

export default function Navbar() {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [itemCount, setItemCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  
  // Get cart items from store
  const cartItems = useCartStore((state) => state.items)
  const wishlistItems = useWishlistStore((state) => state.items)

  // Only update cart count after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true)
    setItemCount(cartItems.length)
    setWishlistCount(wishlistItems.length)
  }, [cartItems.length, wishlistItems.length])

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileMenuOpen])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setProfileMenuOpen(false)
  }

  return (
    <nav className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo width={50} height={50} />

                  <div className="hidden md:flex items-center gap-6">
                   <Link href="/products" className="hover:text-blue-400 transition">
                     Products
                   </Link>
                   <Link href="/categories" className="hover:text-blue-400 transition">
                     Categories
                   </Link>
                   {isSignedIn && (
                     <Link href="/orders" className="hover:text-blue-400 transition">
                       My Orders
                     </Link>
                   )}
                 </div>

          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            <div className="hidden md:block">
              <CurrencySelector />
            </div>

            {isSignedIn ? (
              <div className="hidden md:block relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 hover:text-blue-400 transition focus:outline-none"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'Profile'}
                      className="w-8 h-8 rounded-full border-2 border-blue-400 cursor-pointer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-blue-400 bg-gray-700 flex items-center justify-center cursor-pointer">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <span className="hidden lg:inline">{user?.firstName || 'Profile'}</span>
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>View Profile</span>
                      </Link>
                      <Link
                        href="/profile/addresses"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Delivery Addresses</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
              href="/wishlist"
              className="relative flex items-center gap-2 hover:text-red-400 transition"
            >
              <Heart className="w-6 h-6" />
              {isMounted && wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 hover:text-blue-400 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {isMounted && itemCount > 0 && (
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
                   {/* Currency Selector for Mobile */}
                   <div className="mb-4 pb-4 border-b border-gray-800">
                     <CurrencySelector />
                   </div>
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
                   <Link
                     href="/wishlist"
                     className="block py-2 hover:text-red-400 transition"
                     onClick={() => setMobileMenuOpen(false)}
                   >
                     Wishlist {isMounted && wishlistCount > 0 && `(${wishlistCount})`}
                   </Link>
                   {isSignedIn && (
                     <Link
                       href="/orders"
                       className="block py-2 hover:text-blue-400 transition"
                       onClick={() => setMobileMenuOpen(false)}
                     >
                       My Orders
                     </Link>
                   )}
            {isSignedIn ? (
              <Link
                href="/profile"
                className="block py-2 hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
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

