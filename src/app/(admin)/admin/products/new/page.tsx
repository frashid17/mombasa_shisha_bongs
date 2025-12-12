import ProductForm from '@/components/admin/products/ProductForm'
import prisma from '@/lib/prisma'

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-700 mt-1">Create a new product in your catalog</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}

