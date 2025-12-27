'use client'

import Link from 'next/link'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { ShoppingCart, User, Menu, LogOut, Settings, Heart, MapPin, Shield, Search, Phone, X, Globe, Package } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Logo from './Logo'
import CurrencySelector from './CurrencySelector'
import SearchModal from './SearchModal'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { Currency } from '@/lib/currency'

export default function Navbar() {
  const { user, isSignedIn, isLoaded: authLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const { currency, setCurrency } = useCurrency()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [itemCount, setItemCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
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

  // Check if user is admin - only after auth is loaded to prevent hydration mismatch
  const isAdmin = authLoaded && user?.publicMetadata?.role === 'admin'

  return (
    <>
      {/* Top Header - VapeSoko Style */}
      <nav className="bg-white text-gray-900 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Logo width={60} height={60} />

            {/* Search Bar - Center */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md hover:border-gray-400 transition-colors text-left"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">Search</span>
              </button>
            </div>

            {/* Right Side - Phone, Cart, etc */}
            <div className="flex items-center gap-4">
              {/* Phone Number */}
              <a
                href="tel:+254719541660"
                className="hidden lg:flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">+2547117037140</span>
              </a>

              {/* Currency Selector */}
              <div className="hidden md:block">
                <CurrencySelector />
              </div>

              {/* Admin Button - Only show after auth is loaded to prevent hydration mismatch */}
              {authLoaded && isSignedIn && isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-all"
                  title="Admin Dashboard"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-semibold">Admin</span>
                </Link>
              )}

              {/* Profile/Login */}
              {isSignedIn ? (
                <div className="hidden md:block relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 hover:text-red-600 transition-colors focus:outline-none"
                  >
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || 'Profile'}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:border-red-500 transition-all"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-red-500 transition-all">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <span className="hidden lg:inline font-semibold text-gray-700">{user?.firstName || 'Profile'}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">View Profile</span>
                        </Link>
                        <Link
                          href="/profile/addresses"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">Delivery Addresses</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="hidden md:flex items-center gap-2 font-semibold text-gray-700 hover:text-red-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              )}

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <Heart className="w-6 h-6" />
                {isMounted && wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {isMounted && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle navigation"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu - Sidebar from Right */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Sidebar */}
              <div className="fixed top-0 right-0 h-full w-80 bg-red-600 text-white z-50 md:hidden shadow-2xl animate-slide-in-right">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-red-500">
                    <span className="text-xl font-bold">Mombasa Shisha Bongs</span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-red-700 rounded-lg transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="mb-4 px-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-white/80" />
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as Currency)}
                          className="bg-red-700 border border-red-500 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-white/50"
                        >
                          <option value="KES" className="bg-red-700">KES</option>
                          <option value="USD" className="bg-red-700">USD</option>
                        </select>
                      </div>
                    </div>
                    <Link
                      href="/"
                      className="block py-4 px-6 font-semibold text-white hover:bg-red-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/products"
                      className="block py-4 px-6 font-semibold text-white hover:bg-red-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Products
                    </Link>
                    <Link
                      href="/categories"
                      className="block py-4 px-6 font-semibold text-white hover:bg-red-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Categories
                    </Link>
                    <Link
                      href="/bundles"
                      className="block py-4 px-6 font-semibold text-white hover:bg-red-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bundles
                    </Link>
                    {isSignedIn && (
                      <Link
                        href="/orders"
                        className="block py-4 px-6 font-semibold text-white hover:bg-red-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                    )}
                    <Link
                      href="/wishlist"
                      className="block py-4 px-6 font-semibold text-white hover:bg-red-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Wishlist {isMounted && wishlistCount > 0 && `(${wishlistCount})`}
                    </Link>
                    {authLoaded && isSignedIn && isAdmin && (
                      <Link
                        href="/admin"
                        className="block py-4 px-6 font-semibold text-white hover:bg-red-700 transition-colors mt-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Admin Dashboard
                        </span>
                      </Link>
                    )}
                    {isSignedIn ? (
                      <>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 py-4 px-6 text-white hover:bg-red-700 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5" />
                          View Profile
                        </Link>
                        <Link
                          href="/profile/addresses"
                          className="flex items-center gap-3 py-4 px-6 text-white hover:bg-red-700 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <MapPin className="w-5 h-5" />
                          Manage Address
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setMobileMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 py-4 px-6 text-left text-white hover:bg-red-700 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/sign-in"
                        className="block py-4 px-6 font-semibold text-white hover:bg-red-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Red Navigation Bar - Unified Card */}
        <div className="bg-red-600 text-white">
          <div className="container mx-auto px-4">
            {/* Navigation Links */}
            <div className="flex items-center justify-center gap-1 md:gap-0 border-b border-red-500/30">
              <Link href="/products" className="font-bold uppercase px-4 py-3 hover:bg-red-700 transition-colors text-sm md:text-base">
                Products
              </Link>
              <Link href="/categories" className="font-bold uppercase px-4 py-3 hover:bg-red-700 transition-colors text-sm md:text-base">
                Categories
              </Link>
              <Link href="/bundles" className="font-bold uppercase px-4 py-3 hover:bg-red-700 transition-colors text-sm md:text-base">
                Bundles
              </Link>
              {isSignedIn && (
                <Link href="/orders" className="font-bold uppercase px-4 py-3 hover:bg-red-700 transition-colors text-sm md:text-base">
                  My Orders
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </>
  )
}
