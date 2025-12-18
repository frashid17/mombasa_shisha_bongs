'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignOutPage() {
  const { isSignedIn, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // If not signed in, redirect to home
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isSignedIn, isLoaded, router])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Don't show page if not signed in (will redirect)
  if (!isSignedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign Out</h1>
          <p className="text-gray-600 mb-6">
            Are you sure you want to sign out?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSigningOut}
              className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

