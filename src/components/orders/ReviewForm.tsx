'use client'

import { useState } from 'react'
import { Star, Send, Loader2, CheckCircle } from 'lucide-react'

interface ReviewFormProps {
  productId: string
  productName: string
  orderId: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({
  productId,
  productName,
  orderId,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (comment.length < 10) {
      setError('Comment must be at least 10 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          isAnonymous,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSubmitted(true)
        if (onReviewSubmitted) {
          onReviewSubmitted()
        }
      } else {
        setError(data.error || 'Failed to submit review')
      }
    } catch (err: any) {
      console.error('Review submission error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 font-semibold">Review Submitted!</p>
            <p className="text-green-700 text-sm">
              Your review is now visible to other customers.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-gray-600 text-sm ml-2">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-semibold text-gray-900 mb-2">
          Review Title (Optional)
        </label>
        <input
          type="text"
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none"
          placeholder="e.g., Great product!"
        />
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm font-semibold text-gray-900 mb-2">
          Your Review * (min. 10 characters)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          minLength={10}
          maxLength={5000}
          required
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none resize-none"
          placeholder="Share your experience with this product..."
        />
        <p className="text-xs text-gray-600 mt-1">
          {comment.length}/5000 characters
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is-anonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
        />
        <label htmlFor="is-anonymous" className="text-sm text-gray-700 cursor-pointer">
          Post as Anonymous
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0 || comment.length < 10}
        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Review
          </>
        )}
      </button>
    </form>
  )
}

