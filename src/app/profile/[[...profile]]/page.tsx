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
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <UserProfile
            appearance={{
              baseTheme: undefined,
              elements: {
                // Root and container
                rootBox: 'w-full',
                card: 'bg-white border-gray-200 shadow-none',
                cardBox: 'bg-white',
                
                // Navigation
                navbar: 'bg-white border-gray-200',
                navbarButton: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-lg',
                navbarButtonActive: 'text-blue-600 bg-gray-50 border-blue-600',
                navbarButtonText: 'text-gray-600',
                navbarButtonTextActive: 'text-blue-600',
                
                // Page content
                page: 'bg-white',
                pageHeader: 'text-gray-900',
                headerTitle: 'text-gray-900 text-xl font-bold',
                headerSubtitle: 'text-gray-500',
                headerTitleText: 'text-gray-900',
                headerSubtitleText: 'text-gray-500',
                
                // Forms
                form: 'bg-white',
                formField: 'bg-white',
                formFieldInput: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
                formFieldInputShowPasswordButton: 'text-blue-600 hover:text-blue-700',
                formFieldLabel: 'text-gray-700 font-semibold',
                formFieldLabelText: 'text-gray-700',
                formFieldSuccessText: 'text-green-600',
                formFieldErrorText: 'text-red-600',
                formFieldWarningText: 'text-yellow-600',
                formFieldInputGroup: 'bg-white border-gray-300',
                
                // Buttons
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors',
                formButtonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors',
                formButtonReset: 'text-red-600 hover:text-red-700 rounded-lg transition-colors',
                formButtonText: 'text-white',
                
                // Avatar
                avatarBox: 'w-24 h-24 border-2 border-blue-400',
                avatarImage: 'rounded-full',
                
                // Identity preview
                identityPreview: 'bg-gray-50 border-gray-200 rounded-lg',
                identityPreviewText: 'text-gray-900',
                identityPreviewEditButton: 'text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-50 rounded-lg',
                identityPreviewTextIdentifier: 'text-gray-600',
                
                // Links
                formResendCodeLink: 'text-blue-600 hover:text-blue-700',
                linkButton: 'text-blue-600 hover:text-blue-700',
                linkButtonText: 'text-blue-600',
                
                // Dividers
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-500',
                
                // Alerts and messages
                alertText: 'text-gray-700',
                alertTextDanger: 'text-red-600',
                alertTextSuccess: 'text-green-600',
                alertTextWarning: 'text-yellow-600',
                
                // Badges
                badge: 'bg-blue-600 text-white rounded-full',
                badgeText: 'text-white',
                
                // Sections
                section: 'bg-white',
                sectionHeader: 'text-gray-900',
                sectionHeaderTitle: 'text-gray-900 font-bold',
                sectionHeaderSubtitle: 'text-gray-500',
                sectionContent: 'bg-white',
                
                // Lists
                list: 'bg-white',
                listItem: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
                listItemText: 'text-gray-900',
                listItemTextSecondary: 'text-gray-500',
                
                // Tables
                table: 'bg-white',
                tableHead: 'bg-gray-50',
                tableHeadCell: 'text-gray-700 font-semibold',
                tableBody: 'bg-white',
                tableBodyCell: 'text-gray-900',
                tableRow: 'border-gray-200 hover:bg-gray-50',
                
                // Danger zone
                danger: 'bg-red-50 border-red-200 rounded-lg',
                dangerButton: 'bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors',
                dangerButtonText: 'text-white',
                
                // Modals
                modalContent: 'bg-white border-gray-200',
                modalHeader: 'text-gray-900',
                modalHeaderTitle: 'text-gray-900',
                modalBody: 'text-gray-700',
                
                // Selects and dropdowns
                selectButton: 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50',
                selectOption: 'bg-white text-gray-900 hover:bg-gray-50',
                
                // Checkboxes and radios
                formFieldInputRadio: 'text-blue-600',
                formFieldInputCheckbox: 'text-blue-600',
                
                // Footer
                footer: 'hidden',
                footerPages: 'hidden',
                footerPageButton: 'hidden',
                footerPageButtonText: 'hidden',
                
                // Additional elements
                breadcrumbs: 'text-gray-500',
                breadcrumbItem: 'text-gray-500 hover:text-blue-600',
                breadcrumbItemText: 'text-gray-500',
                breadcrumbItemTextActive: 'text-gray-900',
                
                // Social buttons
                socialButtonsBlockButton: 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-900',
                socialButtonsBlockButtonText: 'text-gray-900',
                
                // Phone input
                phoneInputBox: 'bg-white border-gray-300',
                phoneInputInput: 'text-gray-900',
                
                // Code input
                otpCodeFieldInput: 'bg-white border-gray-300 text-gray-900 focus:border-blue-500',
                
                // File upload
                fileDropAreaBox: 'bg-gray-50 border-gray-300 border-dashed',
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

