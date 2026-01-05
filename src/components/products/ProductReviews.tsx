'use client'

import { useState } from 'react'
import { Star, Filter, X } from 'lucide-react'

type Review = {
  id: string
  userName: string
  rating: number
  comment: string
  title?: string
  isVerified?: boolean
  createdAt: Date
}

export default function ProductReviews({ reviews }: { reviews: Review[] }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)

  if (reviews.length === 0) return null

  // Filter reviews based on selected filters
  const filteredReviews = reviews.filter((review) => {
    if (selectedRating !== null && review.rating !== selectedRating) {
      return false
    }
    if (showVerifiedOnly && !review.isVerified) {
      return false
    }
    return true
  })

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }))

  const hasActiveFilters = selectedRating !== null || showVerifiedOnly

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {averageRating.toFixed(1)} ({filteredReviews.length} of {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Reviews</h3>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedRating(null)
                setShowVerifiedOnly(false)
              }}
              className="ml-auto flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Star Rating Filter */}
          <div>
            <p className="text-sm text-gray-600 mb-2 font-medium">Filter by Rating</p>
            <div className="flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts.find((r) => r.rating === rating)?.count || 0
                const isSelected = selectedRating === rating
                return (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(isSelected ? null : rating)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600'
                    }`}
                  >
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Verified Purchase Filter */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVerifiedOnly}
                onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              />
              <span className="text-gray-700">
                Show only verified purchases ({reviews.filter((r) => r.isVerified).length})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating Breakdown</h3>
        <div className="space-y-2">
          {ratingCounts.map(({ rating, count }) => {
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-gray-900 w-8 font-medium">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-600 text-sm w-12 text-right font-medium">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
          <p className="text-gray-600">No reviews match your filters.</p>
          <button
            onClick={() => {
              setSelectedRating(null)
              setShowVerifiedOnly(false)
            }}
            className="mt-4 text-red-600 hover:text-red-700 transition-colors font-medium"
          >
            Clear filters to see all reviews
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:border-red-500 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</p>
                    {review.isVerified && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="text-gray-900 font-semibold mb-2">{review.title}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
