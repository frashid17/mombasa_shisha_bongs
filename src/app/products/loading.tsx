import { ProductGridSkeleton } from '@/components/products/ProductSkeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="h-10 bg-gray-800 rounded w-64 animate-pulse" />
          <div className="h-12 bg-gray-800 rounded w-full max-w-2xl animate-pulse" />
        </div>
        <div className="mb-6 space-y-4">
          <div className="h-8 bg-gray-800 rounded w-48 animate-pulse" />
          <div className="h-32 bg-gray-800 rounded animate-pulse" />
        </div>
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  )
}

