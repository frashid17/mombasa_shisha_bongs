import Image from 'next/image'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import AddToCartButton from '@/components/cart/AddToCartButton'
import ProductRecommendations from '@/components/products/ProductRecommendations'
import ProductReviews from '@/components/products/ProductReviews'
import { getRecommendedProducts } from '@/lib/recommendations'

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, recommendations] = await Promise.all([
    getProduct(id),
    getRecommendedProducts(id),
  ])

  if (!product || !product.isActive) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={600}
              height={600}
              className="w-full rounded-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-800 rounded-lg" />
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-blue-400 mb-2">{product.category.name}</p>
          <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-400 mb-6">KES {product.price.toLocaleString()}</p>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
              <p className="text-gray-300">{product.description}</p>
            </div>
          )}

          <div className="mb-6 space-y-2">
            <p className="text-sm text-gray-400">SKU: {product.sku}</p>
            {product.stock > 0 ? (
              <p className="text-green-400 font-semibold">In Stock ({product.stock} available)</p>
            ) : (
              <p className="text-red-400 font-semibold">Out of Stock</p>
            )}
          </div>

          {product.stock > 0 && <AddToCartButton product={product} />}
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews reviews={product.reviews.map(review => ({
        ...review,
        title: review.title ?? undefined,
      }))} />

      {/* Recommendations */}
      <ProductRecommendations products={recommendations} />
      </div>
    </div>
  )
}

