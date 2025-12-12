import CategoryForm from '@/components/admin/categories/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
        <p className="text-gray-700 mt-1">Create a new product category</p>
      </div>
      <CategoryForm />
    </div>
  )
}

