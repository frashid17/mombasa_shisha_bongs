'use client'

import { useUser } from '@clerk/nextjs'
import { UserProfile } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please sign in to view your profile</p>
          <Link
            href="/sign-in"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings, profile information, and security</p>
        </div>

        {/* Clerk UserProfile Component */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-gray-800 border-gray-700 shadow-none',
                navbar: 'bg-gray-800 border-gray-700',
                navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700 transition-colors',
                navbarButtonActive: 'text-blue-400 bg-gray-700',
                page: 'bg-gray-800',
                pageHeader: 'text-white',
                headerTitle: 'text-white text-xl font-bold',
                headerSubtitle: 'text-gray-400',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold',
                formButtonSecondary: 'bg-gray-700 hover:bg-gray-600 text-white',
                formFieldInput: 'bg-gray-900 border-gray-600 text-white focus:border-blue-500',
                formFieldLabel: 'text-gray-300 font-semibold',
                formFieldSuccessText: 'text-green-400',
                formFieldErrorText: 'text-red-400',
                avatarBox: 'w-24 h-24',
                identityPreview: 'bg-gray-900 border-gray-600',
                identityPreviewText: 'text-white',
                identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
                formResendCodeLink: 'text-blue-400 hover:text-blue-300',
                footer: 'hidden',
                dividerLine: 'bg-gray-700',
                dividerText: 'text-gray-400',
                alertText: 'text-gray-300',
                alertTextDanger: 'text-red-400',
                badge: 'bg-blue-600 text-white',
                formButtonReset: 'text-red-400 hover:text-red-300',
                // Danger zone styling
                danger: 'bg-red-900/20 border-red-700',
                dangerButton: 'bg-red-600 hover:bg-red-700 text-white',
              },
            }}
            routing="path"
            path="/profile"
          />
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> You can update your name, email, password, and profile picture using the tabs above. 
            Account deletion is available in the "Account" section under "Danger Zone".
          </p>
        </div>
      </div>
    </div>
  )
}

