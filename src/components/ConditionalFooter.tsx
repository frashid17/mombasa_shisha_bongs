'use client'

import { usePathname } from 'next/navigation'
import { FooterContent } from './FooterContent'

interface ConditionalFooterProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    image: string | null
    description: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    parentId: string | null
  }>
}

export default function ConditionalFooter({ categories }: ConditionalFooterProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return null
  }

  return <FooterContent categories={categories} />
}

