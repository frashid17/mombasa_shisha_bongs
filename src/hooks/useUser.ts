'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  imageUrl: string
  role: string
}

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser()

  const formattedUser: User | null = user
    ? {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        phone: user.phoneNumbers[0]?.phoneNumber || '',
        imageUrl: user.imageUrl,
        role: (user.publicMetadata as { role?: string })?.role || 'user',
      }
    : null

  return {
    user: formattedUser,
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    isAdmin: formattedUser?.role === 'admin',
  }
}

