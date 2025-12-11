import prisma from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'

export default async function TopProducts() {
  // Get products with most orders
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 5,
  })

  // Fetch product details
  const productIds = topProducts.map((item) => item.productId)
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      name: true,
      featuredImage: true,
      price: true,
    },
  })

  // Merge data
  const topProductsWithDetails = topProducts.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    return {
      ...item,
      product,
    }
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
        <p className="text-sm text-gray-500 mt-1">Best selling products this month</p>
      </div>

      <div className="p-6">
        {topProductsWithDetails.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No sales data yet</p>
        ) : (
          <div className="space-y-4">
            {topProductsWithDetails.map((item, index) => (
              <div key={item.productId} className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                  {index + 1}
                </div>

                {/* Product Image */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  {item.product?.featuredImage ? (
                    <Image
                      src={item.product.featuredImage}
                      alt={item.product.name || 'Product'}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📦
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/products/${item.productId}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
                  >
                    {item.product?.name || 'Unknown Product'}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {item._sum.quantity} sold · {item._count.id} orders
                  </p>
                </div>

                {/* Revenue */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    KSH{' '}
                    {(
                      Number(item.product?.price || 0) * (item._sum.quantity || 0)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

