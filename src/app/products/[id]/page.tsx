import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ProductColorSelectorWrapper from '@/components/products/ProductColorSelectorWrapper'
import ProductSpecSelectorWrapper from '@/components/products/ProductSpecSelectorWrapper'
import AddToCartButton from '@/components/cart/AddToCartButton'
import BuyNowButton from '@/components/cart/BuyNowButton'
import AddToWishlistButton from '@/components/wishlist/AddToWishlistButton'
import ProductRecommendations from '@/components/products/ProductRecommendations'
import ProductReviews from '@/components/products/ProductReviews'
import FrequentlyBoughtTogether from '@/components/products/FrequentlyBoughtTogether'
import CustomersAlsoBought from '@/components/products/CustomersAlsoBought'
import StockNotificationButton from '@/components/products/StockNotificationButton'
import SocialShareButtons from '@/components/products/SocialShareButtons'
import TrackProductView from '@/components/products/TrackProductView'
import PriceDisplay from '@/components/products/PriceDisplay'
import ProductImageCarousel from '@/components/products/ProductImageCarousel'
import { getRecommendedProducts } from '@/lib/recommendations'
import { serializeProduct, serializeProducts } from '@/lib/prisma-serialize'
import StructuredData from '@/components/seo/StructuredData'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: true,
      colors: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
      specifications: {
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { position: 'asc' }],
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product || !product.isActive) {
    return {
      title: 'Product Not Found',
    }
  }

  const productImage = product.images[0]?.url || '/logo.png'
  const productUrl = `${siteUrl}/products/${id}`

  return {
    title: `${product.name} - Mombasa Shisha Bongs`,
    description: product.description || `${product.name} - Premium quality ${product.category?.name?.toLowerCase() || 'product'} from Mombasa Shisha Bongs. Shop now with fast delivery in Mombasa, Kenya.`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - Premium quality product`,
      url: productUrl,
      images: [productImage.startsWith('http') ? productImage : `${siteUrl}${productImage}`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `${product.name} - Premium quality product`,
      images: [productImage.startsWith('http') ? productImage : `${siteUrl}${productImage}`],
    },
    alternates: {
      canonical: productUrl,
    },
  }
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

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.category?.name || 'Product', url: product.category ? `/categories/${product.category.id}` : '/products' },
    { name: product.name, url: `/products/${id}` },
  ]

  return (
    <>
      <StructuredData type="Product" data={product} />
      <StructuredData type="BreadcrumbList" data={breadcrumbs} />
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
            <>
              {(product.colors && product.colors.length > 0) || 
               (product.specifications && product.specifications.length > 0) ? (
                <div className="mt-6">
                  {product.colors && product.colors.length > 0 && (
                    <ProductColorSelectorWrapper
                      productId={product.id}
                      colors={product.colors || []}
                      product={serializedProduct}
                      specs={product.specifications || []}
                    />
                  )}
                  {product.specifications && product.specifications.length > 0 && 
                   (!product.colors || product.colors.length === 0) && (
                    <ProductSpecSelectorWrapper
                      productId={product.id}
                      specs={product.specifications || []}
                      product={serializedProduct}
                    />
                  )}
                </div>
              ) : (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <AddToCartButton product={serializedProduct} />
                  <BuyNowButton product={serializedProduct} />
                </div>
              )}
            </>
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

      {/* Customers Also Bought */}
      <CustomersAlsoBought productId={id} />

      {/* Recommendations */}
      <ProductRecommendations products={serializedRecommendations} />
      </div>
    </div>
    </>
  )
}

