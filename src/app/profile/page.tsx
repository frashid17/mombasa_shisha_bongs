'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { UserProfile } from '@clerk/nextjs'
import { ArrowLeft, Settings, User, Mail, Lock, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile')

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'account'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Account
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {activeTab === 'profile' ? (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </h2>
                <p className="text-gray-400 text-sm">
                  Update your name, email, and profile picture
                </p>
              </div>
              <UserProfile
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-gray-800 border-gray-700 shadow-none',
                    navbar: 'bg-gray-800 border-gray-700',
                    navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700',
                    navbarButtonActive: 'text-blue-400 bg-gray-700',
                    page: 'bg-gray-800',
                    pageHeader: 'text-white',
                    headerTitle: 'text-white',
                    headerSubtitle: 'text-gray-400',
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    formFieldInput: 'bg-gray-900 border-gray-600 text-white',
                    formFieldLabel: 'text-gray-300',
                    formFieldSuccessText: 'text-green-400',
                    formFieldErrorText: 'text-red-400',
                    avatarBox: 'w-24 h-24',
                    identityPreview: 'bg-gray-900 border-gray-600',
                    identityPreviewText: 'text-white',
                    identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
                    formResendCodeLink: 'text-blue-400 hover:text-blue-300',
                    footer: 'hidden',
                  },
                }}
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </h2>
                <p className="text-gray-400 text-sm">
                  Manage your password, email, and account security
                </p>
              </div>
              <UserProfile
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-gray-800 border-gray-700 shadow-none',
                    navbar: 'bg-gray-800 border-gray-700',
                    navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700',
                    navbarButtonActive: 'text-blue-400 bg-gray-700',
                    page: 'bg-gray-800',
                    pageHeader: 'text-white',
                    headerTitle: 'text-white',
                    headerSubtitle: 'text-gray-400',
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    formFieldInput: 'bg-gray-900 border-gray-600 text-white',
                    formFieldLabel: 'text-gray-300',
                    formFieldSuccessText: 'text-green-400',
                    formFieldErrorText: 'text-red-400',
                    footer: 'hidden',
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-red-900/20 border border-red-700 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-gray-300 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Clerk handles account deletion through UserProfile component
                    // This is just a visual button - actual deletion is in Clerk's UI
                    alert('Please use the "Delete Account" option in the Account Settings tab above.')
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

