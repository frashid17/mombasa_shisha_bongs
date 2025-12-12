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
              baseTheme: undefined,
              elements: {
                // Root and container
                rootBox: 'w-full',
                card: 'bg-gray-800 border-gray-700 shadow-none',
                cardBox: 'bg-gray-800',
                
                // Navigation
                navbar: 'bg-gray-800 border-gray-700',
                navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors rounded-lg',
                navbarButtonActive: 'text-blue-400 bg-gray-700 border-blue-400',
                navbarButtonText: 'text-gray-300',
                navbarButtonTextActive: 'text-blue-400',
                
                // Page content
                page: 'bg-gray-800',
                pageHeader: 'text-white',
                headerTitle: 'text-white text-xl font-bold',
                headerSubtitle: 'text-gray-400',
                headerTitleText: 'text-white',
                headerSubtitleText: 'text-gray-400',
                
                // Forms
                form: 'bg-gray-800',
                formField: 'bg-gray-800',
                formFieldInput: 'bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500',
                formFieldInputShowPasswordButton: 'text-blue-400 hover:text-blue-300',
                formFieldLabel: 'text-gray-300 font-semibold',
                formFieldLabelText: 'text-gray-300',
                formFieldSuccessText: 'text-green-400',
                formFieldErrorText: 'text-red-400',
                formFieldWarningText: 'text-yellow-400',
                formFieldInputGroup: 'bg-gray-900 border-gray-600',
                
                // Buttons
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors',
                formButtonSecondary: 'bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors',
                formButtonReset: 'text-red-400 hover:text-red-300 rounded-lg transition-colors',
                formButtonText: 'text-white',
                
                // Avatar
                avatarBox: 'w-24 h-24 border-2 border-blue-400',
                avatarImage: 'rounded-full',
                
                // Identity preview
                identityPreview: 'bg-gray-900 border-gray-600 rounded-lg',
                identityPreviewText: 'text-white',
                identityPreviewEditButton: 'text-blue-400 hover:text-blue-300 bg-gray-800 hover:bg-gray-700 rounded-lg',
                identityPreviewTextIdentifier: 'text-gray-300',
                
                // Links
                formResendCodeLink: 'text-blue-400 hover:text-blue-300',
                linkButton: 'text-blue-400 hover:text-blue-300',
                linkButtonText: 'text-blue-400',
                
                // Dividers
                dividerLine: 'bg-gray-700',
                dividerText: 'text-gray-400',
                
                // Alerts and messages
                alertText: 'text-gray-300',
                alertTextDanger: 'text-red-400',
                alertTextSuccess: 'text-green-400',
                alertTextWarning: 'text-yellow-400',
                
                // Badges
                badge: 'bg-blue-600 text-white rounded-full',
                badgeText: 'text-white',
                
                // Sections
                section: 'bg-gray-800',
                sectionHeader: 'text-white',
                sectionHeaderTitle: 'text-white font-bold',
                sectionHeaderSubtitle: 'text-gray-400',
                sectionContent: 'bg-gray-800',
                
                // Lists
                list: 'bg-gray-800',
                listItem: 'bg-gray-900 border-gray-700 hover:bg-gray-800',
                listItemText: 'text-white',
                listItemTextSecondary: 'text-gray-400',
                
                // Tables
                table: 'bg-gray-800',
                tableHead: 'bg-gray-900',
                tableHeadCell: 'text-gray-300 font-semibold',
                tableBody: 'bg-gray-800',
                tableBodyCell: 'text-white',
                tableRow: 'border-gray-700 hover:bg-gray-700/50',
                
                // Danger zone
                danger: 'bg-red-900/20 border-red-700 rounded-lg',
                dangerButton: 'bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors',
                dangerButtonText: 'text-white',
                
                // Modals
                modalContent: 'bg-gray-800 border-gray-700',
                modalHeader: 'text-white',
                modalHeaderTitle: 'text-white',
                modalBody: 'text-gray-300',
                
                // Selects and dropdowns
                selectButton: 'bg-gray-900 border-gray-600 text-white hover:bg-gray-800',
                selectOption: 'bg-gray-800 text-white hover:bg-gray-700',
                
                // Checkboxes and radios
                formFieldInputRadio: 'text-blue-600',
                formFieldInputCheckbox: 'text-blue-600',
                
                // Footer
                footer: 'hidden',
                footerPages: 'hidden',
                footerPageButton: 'hidden',
                footerPageButtonText: 'hidden',
                
                // Additional elements
                breadcrumbs: 'text-gray-400',
                breadcrumbItem: 'text-gray-400 hover:text-blue-400',
                breadcrumbItemText: 'text-gray-400',
                breadcrumbItemTextActive: 'text-white',
                
                // Social buttons
                socialButtonsBlockButton: 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white',
                socialButtonsBlockButtonText: 'text-white',
                
                // Phone input
                phoneInputBox: 'bg-gray-900 border-gray-600',
                phoneInputInput: 'text-white',
                
                // Code input
                otpCodeFieldInput: 'bg-gray-900 border-gray-600 text-white focus:border-blue-500',
                
                // File upload
                fileDropAreaBox: 'bg-gray-900 border-gray-600 border-dashed',
                fileDropAreaButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
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

