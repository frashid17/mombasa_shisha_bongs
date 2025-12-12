'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useUser } from '@clerk/nextjs'
import LocationPicker from '@/components/checkout/LocationPicker'
import { MapPin, CreditCard, Smartphone, Wallet, Loader2 } from 'lucide-react'

type PaymentMethod = 'MPESA' | 'CASH_ON_DELIVERY'

interface LocationData {
  lat: number
  lng: number
  address: string
  isWithinMombasa?: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MPESA')
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [isWithinMombasa, setIsWithinMombasa] = useState<boolean | null>(null)
  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.primaryEmailAddress?.emailAddress || '',
    customerPhone: '',
    deliveryAddress: '',
    city: 'Mombasa',
    notes: '',
  })

  const total = getTotal()

  // Redirect to cart if empty - use useEffect to avoid render error
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  const handleLocationSelect = async (location: LocationData) => {
    setSelectedLocation(location)
    setFormData({ ...formData, deliveryAddress: location.address })

    // Use isWithinMombasa from location if provided, otherwise check via API
    if (location.isWithinMombasa !== undefined) {
      setIsWithinMombasa(location.isWithinMombasa)
      // Auto-select payment method based on location
      if (location.isWithinMombasa) {
        setPaymentMethod('CASH_ON_DELIVERY')
      } else {
        setPaymentMethod('MPESA')
      }
    } else {
      // Fallback: Check if location is within Mombasa via API
      try {
        const response = await fetch('/api/location/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: location.lat, lng: location.lng }),
        })
        const data = await response.json()
        setIsWithinMombasa(data.isWithinMombasa)

        // Auto-select payment method based on location
        if (data.isWithinMombasa) {
          setPaymentMethod('CASH_ON_DELIVERY')
        } else {
          setPaymentMethod('MPESA')
        }
      } catch (error) {
        console.error('Error checking location:', error)
        // Default to Mpesa if check fails
        setIsWithinMombasa(false)
        setPaymentMethod('MPESA')
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedLocation) {
      alert('Please select a delivery location on the map')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: Number(item.price),
          })),
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone ? `+254${formData.customerPhone}` : formData.customerPhone,
          deliveryAddress: formData.deliveryAddress,
          deliveryLatitude: parseFloat(selectedLocation.lat.toFixed(7)),
          deliveryLongitude: parseFloat(selectedLocation.lng.toFixed(7)),
          city: formData.city,
          notes: formData.notes,
          paymentMethod: paymentMethod,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        if (paymentMethod === 'CASH_ON_DELIVERY') {
          // For COD, clear cart and redirect to success page
          clearCart()
          router.push(`/orders/${data.order.id}?cod=true`)
        } else {
          // For Mpesa, redirect to payment page
          router.push(`/orders/${data.order.id}`)
        }
      } else {
        alert(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Phone Number *</label>
                  <div className="flex items-center">
                    <span className="bg-gray-700 text-gray-300 px-3 py-2 rounded-l-lg border border-r-0 border-gray-600">
                      +254
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                        setFormData({ ...formData, customerPhone: value })
                      }}
                      className="flex-1 bg-gray-900 border border-gray-600 rounded-r-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="708786000"
                      pattern="[0-9]{9}"
                      maxLength={9}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter 9 digits (e.g., 708786000)</p>
                </div>
              </div>
            </div>

            {/* Location Picker */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Delivery Location</h2>
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            {/* Additional Address Details */}
            {selectedLocation && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Additional Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Additional Address Details (Optional)
                    </label>
                    <textarea
                      value={formData.deliveryAddress.replace(selectedLocation.address, '').trim()}
                      onChange={(e) => {
                        const additional = e.target.value
                        setFormData({
                          ...formData,
                          deliveryAddress: additional
                            ? `${selectedLocation.address}, ${additional}`
                            : selectedLocation.address,
                        })
                      }}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      rows={2}
                      placeholder="Building name, floor, apartment number, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Order Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      rows={2}
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            {selectedLocation && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* Pay on Delivery - Show if within Mombasa or if checking */}
                  {(isWithinMombasa === true || isWithinMombasa === null) && (
                    <label
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        isWithinMombasa === true
                          ? 'border-green-500 hover:bg-gray-700/50'
                          : 'border-gray-600 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH_ON_DELIVERY"
                        checked={paymentMethod === 'CASH_ON_DELIVERY'}
                        onChange={() => {
                          if (isWithinMombasa === true) {
                            setPaymentMethod('CASH_ON_DELIVERY')
                          }
                        }}
                        disabled={isWithinMombasa !== true}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="w-5 h-5 text-green-400" />
                          <span className="font-semibold text-white">Pay on Delivery</span>
                          {isWithinMombasa === true && (
                            <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">
                              Available
                            </span>
                          )}
                          {selectedLocation && isWithinMombasa !== null && !isWithinMombasa && (
                            <span className="text-xs bg-red-900 text-red-400 px-2 py-0.5 rounded-full">
                              Not Available
                            </span>
                          )}
                          {isWithinMombasa === null && selectedLocation && (
                            <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {isWithinMombasa === true
                            ? 'Pay with cash when your order is delivered. Only available within Mombasa.'
                            : isWithinMombasa === false
                              ? 'Pay on Delivery is only available for locations within Mombasa. Please use Mpesa payment.'
                              : 'Checking if location is within Mombasa...'}
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Mpesa Payment - Always available */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors ${
                      paymentMethod === 'MPESA' ? 'border-blue-500' : 'border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MPESA"
                      checked={paymentMethod === 'MPESA'}
                      onChange={() => setPaymentMethod('MPESA')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-white">Mpesa Payment</span>
                        <span className="text-xs bg-blue-900 text-blue-400 px-2 py-0.5 rounded-full">
                          Always Available
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Pay instantly via Mpesa STK Push. You'll receive a payment prompt on your phone.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedLocation}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? 'Processing...'
                : paymentMethod === 'CASH_ON_DELIVERY'
                  ? 'Place Order (Pay on Delivery)'
                  : 'Place Order & Pay'}
            </button>
          </form>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name} x{item.quantity}</span>
                  <span className="text-white">KES {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
              {paymentMethod === 'CASH_ON_DELIVERY' && (
                <p className="text-sm text-green-400 mt-2">
                  ✓ Pay this amount when your order is delivered
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
