'use client'

import { Star, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface ReviewCardProps {
  review: {
    id: string
    userName: string
    rating: number
    title?: string | null
    comment: string
    isVerified?: boolean
    createdAt: Date
    product?: {
      name: string
      images?: Array<{ url: string }>
    } | null
  }
  index?: number
}

export default function ReviewCard({ review, index = 0 }: ReviewCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-6 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
            {review.isVerified && (
              <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                <CheckCircle className="w-3 h-3" />
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {format(new Date(review.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Product Info (if available) */}
      {review.product && (
        <div className="mb-3 pb-3 border-b border-gray-200">
          <p className="text-sm text-red-600 font-medium">Product: {review.product.name}</p>
        </div>
      )}

      {/* Review Content */}
      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
      )}
      <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
        {review.comment}
      </p>
    </div>
  )
}

