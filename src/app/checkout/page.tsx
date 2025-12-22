'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useUser } from '@clerk/nextjs'
import LocationPicker from '@/components/checkout/LocationPicker'
import { MapPin, CreditCard, Wallet, Loader2, Star, Home, Building2, Briefcase, Plus, Calendar } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import Link from 'next/link'

type PaymentMethod = 'PAYSTACK' | 'CASH_ON_DELIVERY'

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
  const { format } = useCurrency()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYSTACK')
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [isWithinMombasa, setIsWithinMombasa] = useState<boolean | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    additionalAddress: '',
    city: 'Mombasa',
    notes: '',
    scheduledDelivery: '',
  })
  
  // Track if we've initialized from user data to prevent overwriting manual input
  const userDataInitialized = useRef(false)

  const total = getTotal()

  // Initialize form data from user when user loads (only once on mount)
  useEffect(() => {
    if (user && !userDataInitialized.current) {
      const userName = user.fullName || ''
      const userEmail = user.primaryEmailAddress?.emailAddress || ''
      
      // Only initialize if we have user data
      if (userName || userEmail) {
        setFormData((prev) => {
          // Only set if fields are empty (preserve any manual input)
          if (!prev.customerName.trim() && !prev.customerEmail.trim()) {
            userDataInitialized.current = true
            return {
              ...prev,
              customerName: userName,
              customerEmail: userEmail,
            }
          }
          // Mark as initialized even if we don't update (to prevent future runs)
          userDataInitialized.current = true
          return prev
        })
      } else {
        // Mark as initialized even if no user data (to prevent future runs)
        userDataInitialized.current = true
      }
    }
  }, [user?.id]) // Only depend on user ID, not the properties that might change

  // Fetch saved addresses if user is logged in
  useEffect(() => {
    if (user) {
      fetch('/api/delivery-addresses')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            setSavedAddresses(data.data)
            // Auto-select default address if available
            const defaultAddress = data.data.find((addr: any) => addr.isDefault)
            if (defaultAddress) {
              handleSelectSavedAddress(defaultAddress)
            }
          }
        })
        .catch((err) => console.error('Error fetching addresses:', err))
    }
  }, [user])

  // Redirect to cart if empty - use useEffect to avoid render error
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  const handleSelectSavedAddress = (address: any) => {
    setSelectedAddressId(address.id)
    setUseSavedAddress(true)
    setSelectedLocation({
      lat: address.latitude || 0,
      lng: address.longitude || 0,
      address: address.address,
      isWithinMombasa: address.city.toLowerCase() === 'mombasa',
    })
    setFormData((prev) => ({
      ...prev,
      customerName: address.fullName,
      customerPhone: address.phone.replace('+254', ''),
      deliveryAddress: address.address,
      city: address.city,
      notes: address.deliveryNotes || '',
    }))
    setIsWithinMombasa(address.city.toLowerCase() === 'mombasa')
    if (address.city.toLowerCase() === 'mombasa') {
      setPaymentMethod('CASH_ON_DELIVERY')
    }
  }

  const handleLocationSelect = async (location: LocationData) => {
    setUseSavedAddress(false)
    setSelectedAddressId(null)
    setSelectedLocation(location)
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: location.address,
      additionalAddress: '',
    }))

    // Use isWithinMombasa from location if provided, otherwise check via API
    if (location.isWithinMombasa !== undefined) {
      setIsWithinMombasa(location.isWithinMombasa)
      // Auto-select payment method based on location
      if (location.isWithinMombasa) {
        setPaymentMethod('CASH_ON_DELIVERY')
      } else {
        setPaymentMethod('PAYSTACK')
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
          setPaymentMethod('PAYSTACK')
        }
      } catch (error) {
        console.error('Error checking location:', error)
        // Default to Paystack if check fails
        setIsWithinMombasa(false)
        setPaymentMethod('PAYSTACK')
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
            colorId: item.colorId || null,
            colorName: item.colorName || null,
            colorValue: item.colorValue || null,
            specId: item.specId || null,
            specType: item.specType || null,
            specName: item.specName || null,
            specValue: item.specValue || null,
          })),
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone ? `+254${formData.customerPhone}` : formData.customerPhone,
          deliveryAddress: formData.additionalAddress
            ? `${formData.deliveryAddress}, ${formData.additionalAddress}`
            : formData.deliveryAddress,
          deliveryLatitude: selectedLocation ? parseFloat(selectedLocation.lat.toFixed(7)) : null,
          deliveryLongitude: selectedLocation ? parseFloat(selectedLocation.lng.toFixed(7)) : null,
          city: formData.city,
          deliveryAddressId: selectedAddressId || undefined,
          notes: formData.notes,
          paymentMethod: paymentMethod,
          scheduledDelivery: formData.scheduledDelivery || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        if (paymentMethod === 'CASH_ON_DELIVERY') {
          // For COD, clear cart and redirect to success page
          clearCart()
          router.push(`/orders/${data.order.id}?cod=true`)
        } else {
          // For Paystack, DON'T clear cart yet - wait for successful payment
          // Redirect to order page where payment button will be shown
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
        <h1 className="text-3xl font-bold text-white mb-4">Checkout</h1>
        
        {/* Account Benefits Message */}
        {!user && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-blue-300 font-semibold mb-1">Creating an account is optional but recommended</p>
                <p className="text-blue-400 text-sm mb-3">
                  With an account, you can track your orders, view order history, and get faster checkout next time. 
                  You can still checkout as a guest, but you'll need your order number to track your delivery.
                </p>
                <div className="flex gap-2">
                  <a
                    href="/sign-up"
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Create Account
                  </a>
                  <a
                    href="/sign-in"
                    className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
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
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: value,
                        }))
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

            {/* Saved Addresses */}
            {user && savedAddresses.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Saved Addresses</h2>
                  <Link
                    href="/profile/addresses"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Manage
                  </Link>
                </div>
                <div className="space-y-2">
                  {savedAddresses.map((address) => {
                    const getIcon = (label: string) => {
                      const lower = label.toLowerCase()
                      if (lower.includes('home')) return <Home className="w-4 h-4" />
                      if (lower.includes('work') || lower.includes('office')) return <Briefcase className="w-4 h-4" />
                      return <Building2 className="w-4 h-4" />
                    }
                    return (
                      <button
                        key={address.id}
                        onClick={() => handleSelectSavedAddress(address)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-gray-600 bg-gray-900 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getIcon(address.label)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white">{address.label}</span>
                                {address.isDefault && (
                                  <span className="flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    <Star className="w-3 h-3 fill-current" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-300">{address.fullName}</p>
                              <p className="text-sm text-gray-400">{address.address}</p>
                              <p className="text-sm text-gray-400">{address.city}</p>
                            </div>
                          </div>
                          {selectedAddressId === address.id && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => {
                    setUseSavedAddress(false)
                    setSelectedAddressId(null)
                  }}
                  className="mt-4 w-full text-center text-blue-400 hover:text-blue-300 text-sm"
                >
                  Use different address
                </button>
              </div>
            )}

            {/* Location Picker */}
            {(!useSavedAddress || !selectedAddressId) && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Delivery Location</h2>
                <LocationPicker 
                  onLocationSelect={handleLocationSelect}
                  initialLocation={selectedLocation || undefined}
                />
              </div>
            )}

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
                      value={formData.additionalAddress}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          additionalAddress: e.target.value,
                        }))
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      rows={2}
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Delivery */}
            {selectedLocation && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Delivery (Optional)
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Preferred Delivery Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDelivery}
                      onChange={(e) => {
                        const selectedDate = new Date(e.target.value)
                        const now = new Date()
                        const maxDate = new Date()
                        maxDate.setDate(maxDate.getDate() + 30) // Max 30 days ahead
                        
                        if (selectedDate < now) {
                          alert('Please select a future date')
                          return
                        }
                        if (selectedDate > maxDate) {
                          alert('Delivery can only be scheduled up to 30 days in advance')
                          return
                        }
                        setFormData((prev) => ({ ...prev, scheduledDelivery: e.target.value }))
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Leave empty for immediate delivery. You can schedule up to 30 days in advance.
                    </p>
                  </div>
                  {formData.scheduledDelivery && (
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                      <p className="text-sm text-blue-300">
                        ✓ Delivery scheduled for:{' '}
                        <span className="font-semibold">
                          {new Date(formData.scheduledDelivery).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>
                  )}
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
                      className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                          ? 'bg-green-900/30 border-2 border-green-500 ring-2 ring-green-500/50'
                          : isWithinMombasa === true
                          ? 'bg-gray-900/50 border-2 border-gray-600 hover:border-gray-500'
                          : 'bg-gray-900/30 border-2 border-gray-600 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="relative mt-1">
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
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-500 bg-transparent'
                          }`}
                        >
                          {paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className={`w-5 h-5 ${
                            paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                              ? 'text-green-400'
                              : 'text-gray-500'
                          }`} />
                          <span className={`font-semibold ${
                            paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                              ? 'text-white'
                              : 'text-gray-400'
                          }`}>
                            Pay on Delivery
                            {paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true && (
                              <span className="ml-2 text-green-400">✓ Selected</span>
                            )}
                          </span>
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
                        <p className={`text-sm ${
                          paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}>
                          {isWithinMombasa === true
                            ? 'Pay with cash when your order is delivered. Delivery fees will be collected separately in cash by the delivery person based on your area (CBD/town areas may have different fees).'
                            : isWithinMombasa === false
                              ? 'Pay on Delivery is only available for locations within Mombasa. Please use Paystack payment.'
                              : 'Checking if location is within Mombasa...'}
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Paystack Payment - Always available */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'PAYSTACK'
                        ? 'bg-blue-900/30 border-2 border-blue-500 ring-2 ring-blue-500/50'
                        : 'bg-gray-900/50 border-2 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="relative mt-1">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYSTACK"
                        checked={paymentMethod === 'PAYSTACK'}
                        onChange={() => setPaymentMethod('PAYSTACK')}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'PAYSTACK'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-500 bg-transparent'
                        }`}
                      >
                        {paymentMethod === 'PAYSTACK' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className={`w-5 h-5 ${
                          paymentMethod === 'PAYSTACK'
                            ? 'text-blue-400'
                            : 'text-gray-500'
                        }`} />
                        <span className={`font-semibold ${
                          paymentMethod === 'PAYSTACK'
                            ? 'text-white'
                            : 'text-gray-400'
                        }`}>
                          Paystack Payment
                          {paymentMethod === 'PAYSTACK' && (
                            <span className="ml-2 text-blue-400">✓ Selected</span>
                          )}
                        </span>
                        <span className="text-xs bg-blue-900 text-blue-400 px-2 py-0.5 rounded-full">
                          Always Available
                        </span>
                      </div>
                      <p className={`text-sm ${
                        paymentMethod === 'PAYSTACK'
                          ? 'text-gray-300'
                          : 'text-gray-500'
                      }`}>
                        Pay securely with cards, bank transfer, or mobile money via Paystack. Supports Visa, Mastercard, and Mpesa.
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
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.cartItemId || item.id} className="border-b border-gray-700 pb-3 last:border-b-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 font-medium">{item.name}</span>
                    <span className="text-white font-semibold">{format(item.price * item.quantity)}</span>
                  </div>
                  <div className="space-y-1">
                    {item.colorName && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Color:</span>
                        {item.colorValue && (
                          <div
                            className="w-3 h-3 rounded-full border border-gray-600"
                            style={{ backgroundColor: item.colorValue }}
                          />
                        )}
                        <span>{item.colorName}</span>
                      </div>
                    )}
                    {item.specName && (
                      <div className="text-xs text-gray-400">
                        <span>{item.specType || 'Spec'}:</span> <span className="text-gray-300">{item.specName}</span>
                        {item.specValue && (
                          <span className="text-gray-500"> ({item.specValue})</span>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Qty: {item.quantity} × {format(item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>{format(total)}</span>
              </div>
              {paymentMethod === 'CASH_ON_DELIVERY' && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-green-400">
                    ✓ Pay this amount when your order is delivered
                  </p>
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                    <p className="text-xs text-yellow-300 font-semibold mb-1">📦 Delivery Fee Notice</p>
                    <p className="text-xs text-yellow-400">
                      Delivery fees are not included in this total. The delivery person will collect the delivery fee separately in cash based on your area (CBD/town areas may have different fees).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
