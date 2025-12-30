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
import ProductPriceWrapper from '@/components/products/ProductPriceWrapper'
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

// Lighter query just for metadata to reduce work in generateMetadata
async function getProductMeta(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      images: {
        take: 1,
        select: {
          url: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProductMeta(id)

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
  
  // Ensure specifications include price field
  const serializedSpecs = product.specifications?.map((spec: any) => ({
    id: spec.id,
    type: spec.type,
    name: spec.name,
    value: spec.value,
    price: spec.price ? Number(spec.price) : null,
    isActive: spec.isActive,
  })) || []

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
      <div className="min-h-screen bg-white">
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

        {/* Product Info - White Background */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
          {product.category && (
            <p className="text-red-600 mb-2 uppercase text-sm font-semibold">{product.category.name}</p>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <ProductPriceWrapper
            basePrice={Number(product.price)}
            compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
            specs={serializedSpecs}
          >
          </ProductPriceWrapper>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          <div className="mb-6 space-y-2">
            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
            {product.stock > 0 ? (
              <p className="text-green-600 font-semibold">In Stock ({product.stock} available)</p>
            ) : (
              <p className="text-red-600 font-semibold">Out of Stock</p>
            )}
          </div>

          {/* Action Buttons - Like Screenshot */}
          {product.stock > 0 && (
            <ProductPriceWrapper
              basePrice={Number(product.price)}
              compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
              specs={serializedSpecs}
            >
              {(product.colors && product.colors.length > 0) || 
               (serializedSpecs && serializedSpecs.length > 0) ? (
                <div className="mt-6">
                  {product.colors && product.colors.length > 0 && (
                    <ProductColorSelectorWrapper
                      productId={product.id}
                      colors={product.colors || []}
                      product={serializedProduct}
                      specs={serializedSpecs}
                    />
                  )}
                  {serializedSpecs && serializedSpecs.length > 0 && 
                   (!product.colors || product.colors.length === 0) && (
                    <ProductSpecSelectorWrapper
                      productId={product.id}
                      specs={serializedSpecs}
                      product={serializedProduct}
                    />
                  )}
                </div>
              ) : (
                <div className="mt-6 flex items-center gap-3">
                  <AddToCartButton product={serializedProduct} />
                  <AddToWishlistButton product={serializedProduct} />
                </div>
              )}
            </ProductPriceWrapper>
          )}

          <div className="mt-4">
            <SocialShareButtons
              productName={product.name}
              productUrl={`/products/${product.id}`}
              productImage={product.images[0]?.url}
            />
          </div>

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

