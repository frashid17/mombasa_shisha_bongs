'use client'

import { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface StockNotificationButtonProps {
  productId: string
  productName: string
  isInStock: boolean
}

export default function StockNotificationButton({
  productId,
  productName,
  isInStock,
}: StockNotificationButtonProps) {
  const { user, isSignedIn } = useUser()
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubscribe = async () => {
    if (!isSignedIn && !email) {
      setShowForm(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/products/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          email: isSignedIn ? user?.primaryEmailAddress?.emailAddress : email,
        }),
      })

      if (res.ok) {
        setSubscribed(true)
        setShowForm(false)
        alert('You will be notified when this product is back in stock!')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      alert('Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  if (isInStock) return null

  return (
    <div className="mt-4">
      {!subscribed ? (
        <div>
          {showForm ? (
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubscribe}
                  disabled={loading || !email}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {loading ? 'Subscribing...' : 'Notify Me'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              <Bell className="w-4 h-4" />
              Notify Me When Back in Stock
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-600 rounded-lg text-green-400">
          <BellOff className="w-4 h-4" />
          <span>You will be notified when this product is back in stock</span>
        </div>
      )}
    </div>
  )
}

