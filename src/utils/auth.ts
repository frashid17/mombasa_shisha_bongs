import { auth, currentUser } from '@clerk/nextjs/server'
import { unauthorizedError, forbiddenError } from './api-response'

/**
 * User type from Clerk
 */
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  imageUrl: string
  role: string
}

/**
 * Get current user from Clerk with formatted data
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    phone: user.phoneNumbers[0]?.phoneNumber || '',
    imageUrl: user.imageUrl,
    role: (user.publicMetadata as { role?: string })?.role || 'user',
  }
}

/**
 * Require authentication in API routes
 * Returns AuthUser if authenticated, or error Response if not
 */
export async function requireAuth(): Promise<AuthUser | Response> {
  const { userId } = await auth()

  if (!userId) {
    return unauthorizedError('Authentication required')
  }

  const user = await getCurrentUser()

  if (!user) {
    return unauthorizedError('User not found')
  }

  return user
}

/**
 * Require admin role in API routes
 * Returns AuthUser if admin, or error Response if not
 */
export async function requireAdmin(): Promise<AuthUser | Response> {
  const user = await requireAuth()

  // If user is a Response (error), return it
  if (user instanceof Response) {
    return user
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    return forbiddenError('Admin access required')
  }

  return user
}

/**
 * Check if current user is admin (returns boolean)
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Check if current user is authenticated (returns boolean)
 */
export function isAuthenticated(): boolean {
  const { userId } = auth()
  return !!userId
}

/**
 * Get user ID (returns null if not authenticated)
 */
export function getUserId(): string | null {
  const { userId } = auth()
  return userId
}

/**
 * Get session ID
 */
export function getSessionId(): string | null {
  const { sessionId } = auth()
  return sessionId
}

/**
 * Check if user owns resource (by userId)
 */
export function checkOwnership(resourceUserId: string): boolean {
  const currentUserId = getUserId()
  return currentUserId === resourceUserId
}

/**
 * Require ownership or admin access
 */
export async function requireOwnershipOrAdmin(
  resourceUserId: string
): Promise<AuthUser | Response> {
  const user = await requireAuth()

  // If user is a Response (error), return it
  if (user instanceof Response) {
    return user
  }

  // Check if user owns the resource or is admin
  if (user.id !== resourceUserId && user.role !== 'admin') {
    return forbiddenError('You do not have permission to access this resource')
  }

  return user
}

