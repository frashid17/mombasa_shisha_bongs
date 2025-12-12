import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import CategoryForm from '@/components/admin/categories/CategoryForm'

async function getCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
  })
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await getCategory(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-700 mt-1">Update category information</p>
      </div>
      <CategoryForm category={category} />
    </div>
  )
}

