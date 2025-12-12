import Link from 'next/link'
import Image from 'next/image'
import { Edit, Trash2, Eye } from 'lucide-react'
import type { Product } from '@prisma/client'

type ProductWithRelations = Product & {
  category: { name: string }
  images: Array<{ url: string }>
  _count: { orderItems: number }
}

export default function ProductsTable({ products }: { products: ProductWithRelations[] }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Sales</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.category.name}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {product.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                <td className="px-6 py-4 text-sm">{product._count.orderItems}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
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
      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">No products found</div>
      )}
    </div>
  )
}

