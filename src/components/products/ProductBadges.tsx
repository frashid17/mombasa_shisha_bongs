'use client'

import { Badge } from 'lucide-react'

interface ProductBadgesProps {
  isNewArrival?: boolean
  isFeatured?: boolean
  hasDiscount?: boolean
  stock: number
  compareAtPrice?: number | null
  price: number
  createdAt?: Date | string
}

export default function ProductBadges({
  isNewArrival,
  isFeatured,
  hasDiscount,
  stock,
  compareAtPrice,
  price,
  createdAt,
}: ProductBadgesProps) {
  const badges = []

  // Check if product is new (created in last 30 days)
  const isNew = createdAt
    ? new Date().getTime() - new Date(createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : false

  // Check if it's a bestseller (featured or has many sales)
  const isBestseller = isFeatured

  // Check if it's on sale
  const isOnSale = hasDiscount && compareAtPrice && compareAtPrice > price

  // Check if stock is low
  const isLowStock = stock > 0 && stock <= 10

  // Badge priority: SALE > NEW > BESTSELLER > LOW STOCK
  if (isOnSale) {
    badges.push(
      <div
        key="sale"
        className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10 animate-pulse"
      >
        SALE
      </div>
    )
  }

  if (isNew || isNewArrival) {
    badges.push(
      <div
        key="new"
        className={`absolute top-2 ${isOnSale ? 'right-2' : 'left-2'} bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10`}
      >
        NEW
      </div>
    )
  }

  if (isBestseller && !isOnSale && !isNew) {
    badges.push(
      <div
        key="bestseller"
        className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10"
      >
        BESTSELLER
      </div>
    )
  }

  if (isLowStock && !isOnSale && !isNew && !isBestseller) {
    badges.push(
      <div
        key="lowstock"
        className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10"
      >
        LOW STOCK
      </div>
    )
  }

  return <>{badges}</>
}

