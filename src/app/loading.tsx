export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton - Shows immediately */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              {/* Actual h1 shows immediately for LCP */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                Premium Shisha & Vapes
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-600 max-w-2xl mx-auto">
                Mix & match any flavor & strength. Fast delivery, secure payment, and authentic products in Mombasa.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="h-12 w-32 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-12 w-48 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Rest of page skeleton */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
