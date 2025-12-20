import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import AddToCartButton from '@/components/cart/AddToCartButton'
import BuyNowButton from '@/components/cart/BuyNowButton'
import AddToWishlistButton from '@/components/wishlist/AddToWishlistButton'
import ProductRecommendations from '@/components/products/ProductRecommendations'
import ProductReviews from '@/components/products/ProductReviews'
import FrequentlyBoughtTogether from '@/components/products/FrequentlyBoughtTogether'
import StockNotificationButton from '@/components/products/StockNotificationButton'
import SocialShareButtons from '@/components/products/SocialShareButtons'
import TrackProductView from '@/components/products/TrackProductView'
import PriceDisplay from '@/components/products/PriceDisplay'
import ProductImageCarousel from '@/components/products/ProductImageCarousel'
import { getRecommendedProducts } from '@/lib/recommendations'
import { serializeProduct, serializeProducts } from '@/lib/prisma-serialize'

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
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

  // Serialize product to convert Decimal fields to numbers for Client Components
  const serializedProduct = serializeProduct(product)
  const serializedRecommendations = serializeProducts(recommendations)

  return (
    <div className="min-h-screen bg-gray-900">
      <TrackProductView productId={id} />
      <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <ProductImageCarousel
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <p className="text-blue-400 mb-2">{product.category.name}</p>
          )}
          <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
          <div className="mb-6">
            <PriceDisplay 
              price={Number(product.price)} 
              compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
              size="xl"
            />
          </div>

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

          <div className="mb-6">
            <AddToWishlistButton product={serializedProduct} />
          </div>

          <SocialShareButtons
            productName={product.name}
            productUrl={`/products/${product.id}`}
            productImage={product.images[0]?.url}
          />

          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <AddToCartButton product={serializedProduct} />
              <BuyNowButton product={serializedProduct} />
            </div>
          )}

          {product.stock === 0 && (
            <StockNotificationButton
              productId={product.id}
              productName={product.name}
              isInStock={false}
            />
          )}
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews reviews={product.reviews.map(review => ({
        ...review,
        title: review.title ?? undefined,
      }))} />

      {/* Frequently Bought Together */}
      <FrequentlyBoughtTogether productId={id} />

      {/* Recommendations */}
      <ProductRecommendations products={serializedRecommendations} />
      </div>
    </div>
  )
}

