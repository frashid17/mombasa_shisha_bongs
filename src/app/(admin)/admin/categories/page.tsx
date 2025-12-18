import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/prisma'
import CategoriesTable from '@/components/admin/categories/CategoriesTable'

async function getCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      isActive: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm sm:text-base text-gray-700 mt-1">Manage product categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add Category</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>
      <CategoriesTable categories={categories} />
    </div>
  )
}

