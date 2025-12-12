import Link from 'next/link'
import Image from 'next/image'

export default function ProductRecommendations({ products }: { products: any[] }) {
  if (products.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden hover:border-blue-500 hover:shadow-blue-500/20 transition-all"
          >
            {product.images[0] ? (
              <div className="relative h-48 bg-gray-800">
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800" />
            )}
            <div className="p-4">
              <p className="text-sm text-blue-400 font-semibold mb-1">{product.category.name}</p>
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-blue-400 font-bold">KES {product.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

