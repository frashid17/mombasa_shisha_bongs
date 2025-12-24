import Link from 'next/link'
import Image from 'next/image'

export default function ProductRecommendations({ products }: { products: any[] }) {
  if (products.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:border-red-500 hover:shadow-md transition-all"
          >
            {product.images[0] ? (
              <div className="relative h-48 bg-white">
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-48 bg-gray-50" />
            )}
            <div className="p-4">
              {product.category && (
                <p className="text-sm text-red-600 font-semibold mb-1">{product.category.name}</p>
              )}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors">{product.name}</h3>
              <p className="text-gray-900 font-bold">KES {product.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

