'use client'

import { useState } from 'react'
import { X, Mail, Loader2, CheckCircle, AlertCircle, Sparkles, Tag, TrendingUp, Gift } from 'lucide-react'
import ProductSelector from './ProductSelector'
import { EmailTopic, ProductData } from '@/lib/email-templates'

type SelectedProduct = ProductData & {
  images?: Array<{ url: string }>
}

interface BulkEmailModalProps {
  isOpen: boolean
  onClose: () => void
  customerCount: number
  onSuccess?: () => void
}

const TOPICS: Array<{ value: EmailTopic; label: string; icon: any; description: string }> = [
  {
    value: 'NEW_ITEMS',
    label: 'New Items',
    icon: Sparkles,
    description: 'Announce newly arrived products',
  },
  {
    value: 'DISCOUNTS',
    label: 'Discounts',
    icon: Tag,
    description: 'Send discount offers on selected products',
  },
  {
    value: 'TRENDING',
    label: 'Trending Items',
    icon: TrendingUp,
    description: 'Showcase popular and trending products',
  },
  {
    value: 'OFFERS',
    label: 'Special Offers',
    icon: Gift,
    description: 'Send special promotional offers',
  },
]

export default function BulkEmailModal({
  isOpen,
  onClose,
  customerCount,
  onSuccess,
}: BulkEmailModalProps) {
  const [topic, setTopic] = useState<EmailTopic | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [discountInfo, setDiscountInfo] = useState('')
  const [offerInfo, setOfferInfo] = useState('')
  const [includeGuest, setIncludeGuest] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    results?: { total: number; sent: number; failed: number; errors: string[] }
    message?: string
    error?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic) {
      alert('Please select a topic')
      return
    }

    if (selectedProducts.length === 0) {
      alert('Please select at least one product')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/customers/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          products: selectedProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            image: p.images?.[0]?.url,
            slug: p.slug,
            discountPercent: p.discountPercent,
          })),
          discountInfo: topic === 'DISCOUNTS' ? discountInfo : undefined,
          offerInfo: topic === 'OFFERS' ? offerInfo : undefined,
          includeGuest,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setResult({
          success: true,
          results: data.results,
          message: data.message,
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to send emails',
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTopic(null)
      setSelectedProducts([])
      setDiscountInfo('')
      setOfferInfo('')
      setIncludeGuest(false)
      setResult(null)
      onClose()
    }
  }

  const selectedTopicData = topic ? TOPICS.find((t) => t.value === topic) : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Send Bulk Email</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!result ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Recipients:</strong> This email will be sent to:
                </p>
                <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc space-y-1">
                  <li>Top 10 customers by total spending</li>
                  <li>All customers who have spent more than KES 10,000</li>
                </ul>
                <p className="text-sm text-blue-800 mt-2">
                  (Maximum recipients: ~10-15 customers)
                </p>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Email Topic *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TOPICS.map((topicOption) => {
                    const Icon = topicOption.icon
                    const isSelected = topic === topicOption.value
                    return (
                      <button
                        key={topicOption.value}
                        type="button"
                        onClick={() => {
                          setTopic(topicOption.value)
                          setSelectedProducts([])
                          setDiscountInfo('')
                          setOfferInfo('')
                        }}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected ? 'text-blue-600' : 'text-gray-400'
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}
                          >
                            {topicOption.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{topicOption.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Product Selection */}
              {topic && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Products * (at least 1 required)
                  </label>
                  <ProductSelector
                    selectedProducts={selectedProducts}
                    onProductsChange={setSelectedProducts}
                    showDiscount={topic === 'DISCOUNTS'}
                  />
                  {selectedProducts.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      Please select at least one product
                    </p>
                  )}
                </div>
              )}

              {/* Discount Info (for DISCOUNTS topic) */}
              {topic === 'DISCOUNTS' && (
                <div>
                  <label htmlFor="discountInfo" className="block text-sm font-semibold text-gray-900 mb-2">
                    Discount Information (Optional)
                  </label>
                  <textarea
                    id="discountInfo"
                    value={discountInfo}
                    onChange={(e) => setDiscountInfo(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="e.g., Limited time only! Get up to 50% off on selected items. Valid until end of month."
                  />
                  <p className="text-xs text-gray-500 mt-1">{discountInfo.length}/500 characters</p>
                </div>
              )}

              {/* Offer Info (for OFFERS topic) */}
              {topic === 'OFFERS' && (
                <div>
                  <label htmlFor="offerInfo" className="block text-sm font-semibold text-gray-900 mb-2">
                    Offer Details (Optional)
                  </label>
                  <textarea
                    id="offerInfo"
                    value={offerInfo}
                    onChange={(e) => setOfferInfo(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="e.g., Buy 2 Get 1 Free! Or Free shipping on orders above KES 5,000."
                  />
                  <p className="text-xs text-gray-500 mt-1">{offerInfo.length}/500 characters</p>
                </div>
              )}

              {/* Guest Customers Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeGuest"
                  checked={includeGuest}
                  onChange={(e) => setIncludeGuest(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeGuest" className="text-sm text-gray-700 cursor-pointer">
                  Include guest customers (customers who checked out without an account)
                </label>
              </div>

              {/* Preview */}
              {topic && selectedProducts.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Email Preview:</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <strong>Topic:</strong> {selectedTopicData?.label}
                    </p>
                    <p>
                      <strong>Subject:</strong> {selectedTopicData?.label === 'New Items' ? '🆕 New Products Just Arrived!' : selectedTopicData?.label === 'Discounts' ? '🎉 Special Discounts - Limited Time Only!' : selectedTopicData?.label === 'Trending Items' ? '🔥 Trending Now - Most Popular Products!' : '🎁 Special Offers - Don\'t Miss Out!'}
                    </p>
                    <p>
                      <strong>Products:</strong> {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !topic ||
                    selectedProducts.length === 0
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send to All Customers
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Emails Sent Successfully!
                      </h3>
                      {result.results && (
                        <div className="space-y-2 text-sm text-green-800">
                          <p>
                            <strong>Total Recipients:</strong> {result.results.total}
                          </p>
                          <p>
                            <strong>Successfully Sent:</strong> {result.results.sent}
                          </p>
                          {result.results.failed > 0 && (
                            <p className="text-orange-700">
                              <strong>Failed:</strong> {result.results.failed}
                            </p>
                          )}
                        </div>
                      )}
                      {result.message && (
                        <p className="text-sm text-green-700 mt-3">{result.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                      <p className="text-sm text-red-800">{result.error || 'Failed to send emails'}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.results && result.results.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Errors:</h4>
                  <ul className="text-xs text-yellow-800 space-y-1 max-h-32 overflow-y-auto">
                    {result.results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
