import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'

export default function CategoriesTable({ categories }: { categories: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Products</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{category.description || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{category._count.products}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">No categories found</div>
      )}
    </div>
  )
}

