import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Edit, Package, CheckCircle, XCircle, Star } from 'lucide-react'
import { serializeProduct } from '@/lib/prisma-serialize'

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  })
}

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const serializedProduct = serializeProduct(product)
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-700 mt-1">Product Details</p>
        </div>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Images</h2>
            {product.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image) => (
                  <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={image.url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No images available
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Product Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{product.description || 'No description provided'}</p>
              </div>
              {product.shortDescription && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Short Description</p>
                  <p className="text-gray-900">{product.shortDescription}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">SKU</p>
                  <p className="text-gray-900 font-mono">{product.sku || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="text-gray-900">{product.category?.name || 'Uncategorized'}</p>
                </div>
              </div>
              {product.brand && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Brand</p>
                  <p className="text-gray-900">{product.brand}</p>
                </div>
              )}
              {product.tags && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-lg font-bold text-gray-900">
                  KES {Number(product.price).toLocaleString()}
                </p>
              </div>
              {product.compareAtPrice && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Compare At Price</p>
                  <p className="text-lg font-semibold text-gray-500 line-through">
                    KES {Number(product.compareAtPrice).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Stock</p>
                <p className={`text-lg font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock}
                </p>
              </div>
              {product.costPrice && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cost Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    KES {Number(product.costPrice).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Track Inventory:</p>
                <span className={product.trackInventory ? 'text-green-600' : 'text-gray-400'}>
                  {product.trackInventory ? 'Yes' : 'No'}
                </span>
              </div>
              {product.trackInventory && product.lowStockThreshold && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Low Stock Threshold:</p>
                  <span className="text-gray-900 font-semibold">{product.lowStockThreshold}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Allow Backorder:</p>
                <span className={product.allowBackorder ? 'text-green-600' : 'text-gray-400'}>
                  {product.allowBackorder ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews ({product.reviews.length})</h2>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.userName}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {review.title && (
                      <p className="font-semibold text-gray-900 mb-1">{review.title}</p>
                    )}
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Featured</span>
                <span className={product.isFeatured ? 'text-green-600' : 'text-gray-400'}>
                  {product.isFeatured ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Arrival</span>
                <span className={product.isNewArrival ? 'text-green-600' : 'text-gray-400'}>
                  {product.isNewArrival ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Sales</span>
                <span className="font-semibold text-gray-900">{product._count.orderItems}</span>
              </div>
              {product.reviews.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Reviews</span>
                <span className="font-semibold text-gray-900">{product.reviews.length}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Timestamps</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="text-sm text-gray-900">
                  {format(new Date(product.createdAt), 'MMMM d, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="text-sm text-gray-900">
                  {format(new Date(product.updatedAt), 'MMMM d, yyyy HH:mm')}
                </p>
              </div>
              {product.publishedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Published At</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(product.publishedAt), 'MMMM d, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SEO Information */}
          {(product.metaTitle || product.metaDescription) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Information</h2>
              <div className="space-y-3">
                {product.metaTitle && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Meta Title</p>
                    <p className="text-sm text-gray-900">{product.metaTitle}</p>
                  </div>
                )}
                {product.metaDescription && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Meta Description</p>
                    <p className="text-sm text-gray-900">{product.metaDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Physical Attributes */}
          {(product.weight || product.length || product.width || product.height) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Physical Attributes</h2>
              <div className="grid grid-cols-2 gap-3">
                {product.weight && (
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-sm font-semibold text-gray-900">{Number(product.weight)} kg</p>
                  </div>
                )}
                {product.length && (
                  <div>
                    <p className="text-sm text-gray-600">Length</p>
                    <p className="text-sm font-semibold text-gray-900">{Number(product.length)} cm</p>
                  </div>
                )}
                {product.width && (
                  <div>
                    <p className="text-sm text-gray-600">Width</p>
                    <p className="text-sm font-semibold text-gray-900">{Number(product.width)} cm</p>
                  </div>
                )}
                {product.height && (
                  <div>
                    <p className="text-sm text-gray-600">Height</p>
                    <p className="text-sm font-semibold text-gray-900">{Number(product.height)} cm</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

