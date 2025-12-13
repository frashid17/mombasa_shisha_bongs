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
          <h2 className="text-2xl font-bold text-white mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-400">
              {averageRating.toFixed(1)} ({filteredReviews.length} of {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Filter Reviews</h3>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedRating(null)
                setShowVerifiedOnly(false)
              }}
              className="ml-auto flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Star Rating Filter */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Filter by Rating</p>
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
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-500'
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
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">
                Show only verified purchases ({reviews.filter((r) => r.isVerified).length})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Rating Breakdown</h3>
        <div className="space-y-2">
          {ratingCounts.map(({ rating, count }) => {
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-white w-8">{rating}★</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">No reviews match your filters.</p>
          <button
            onClick={() => {
              setSelectedRating(null)
              setShowVerifiedOnly(false)
            }}
            className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear filters to see all reviews
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{review.userName}</p>
                    {review.isVerified && (
                      <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full border border-green-700">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="text-white font-medium mb-1">{review.title}</p>
                  )}
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'fill-yellow-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
